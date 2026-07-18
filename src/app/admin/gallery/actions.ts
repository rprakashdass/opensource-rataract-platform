"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";

export async function createAlbum({ title, description }: { title: string; description?: string }) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    if (!title?.trim()) return { error: "Album title is required" };

    const album = await prisma.album.create({
      data: {
        clubId: club.id,
        title: title.trim(),
        description: description?.trim() || null,
      },
    });

    revalidatePath("/admin/gallery");
    return { success: true, album };
  } catch (error: any) {
    return { error: error.message || "Failed to create album" };
  }
}

export async function renameAlbum(albumId: string, title: string, description?: string) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    if (!title?.trim()) return { error: "Album title is required" };

    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album || album.clubId !== club.id) return { error: "Album not found" };

    const updated = await prisma.album.update({
      where: { id: albumId },
      data: { title: title.trim(), description: description?.trim() || null },
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/albums/${albumId}`);
    return { success: true, album: updated };
  } catch (error: any) {
    return { error: error.message || "Failed to rename album" };
  }
}

export async function deleteAlbum(albumId: string) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album || album.clubId !== club.id) return { error: "Album not found" };

    await prisma.$transaction([
      prisma.media.updateMany({ where: { albumId }, data: { albumId: null } }),
      prisma.album.delete({ where: { id: albumId } }),
    ]);

    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete album" };
  }
}

export async function moveMediaToAlbum(mediaId: string, targetAlbumId: string | null) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.clubId !== club.id) return { error: "Media not found" };

    if (targetAlbumId) {
      const targetAlbum = await prisma.album.findUnique({ where: { id: targetAlbumId } });
      if (!targetAlbum || targetAlbum.clubId !== club.id) return { error: "Album not found" };
    }

    await prisma.media.update({
      where: { id: mediaId },
      data: { albumId: targetAlbumId }
    });
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to move media" };
  }
}
