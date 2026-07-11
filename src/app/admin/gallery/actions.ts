"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

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
    return { success: true, albumId: album.id };
  } catch (error) {
    console.error("Failed to create album:", error);
    return { error: "An error occurred while creating the album." };
  }
}
