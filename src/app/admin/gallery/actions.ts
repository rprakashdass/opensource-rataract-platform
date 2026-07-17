"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function createAlbum(data: { title: string; description: string }) {
  const session = await getSession();
  const club = await getCurrentClub();

  if (!session || !club) {
    return { error: "Unauthorized" };
  }

  if (!canManageWebsite(session)) {
    return { error: "Permission denied" };
  }

  try {
    const album = await prisma.album.create({
      data: {
        title: data.title,
        description: data.description,
        clubId: club.id,
      }
    });

    revalidatePath("/admin/gallery");
    revalidatePublicRoutes();
    return { success: true, albumId: album.id };
  } catch (error) {
    console.error("Failed to create album:", error);
    return { error: "An error occurred while creating the album." };
  }
}

export async function deleteAlbum(albumId: string) {
  const session = await getSession();
  const club = await getCurrentClub();

  if (!session || !club) return { error: "Unauthorized" };
  if (!canManageWebsite(session)) return { error: "Permission denied" };

  try {
    // Detach media first to avoid cascading delete
    await prisma.media.updateMany({
      where: { albumId, clubId: club.id },
      data: { albumId: null }
    });
    
    // Delete the album
    await prisma.album.delete({
      where: { id: albumId, clubId: club.id }
    });
    
    revalidatePath("/admin/gallery");
    revalidatePublicRoutes();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete album:", error);
    return { error: "Failed to delete album" };
  }
}
