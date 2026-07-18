"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageClub } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";

export async function updateMediaTitle(mediaId: string, newTitle: string) {
  try {
    const session = await getSession();
    if (!session || !session.id) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.clubId !== club.id) return { error: "Media not found" };

    // Allow the original uploader or a club admin to edit
    const isAdmin = canManageClub(session);
    if (!isAdmin && media.uploadedById !== session.id) {
      return { error: "Unauthorized to edit this media title" };
    }

    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: { title: newTitle.trim() }
    });

    return { success: true, media: updatedMedia };
  } catch (error: any) {
    console.error("updateMediaTitle error:", error);
    return { error: error.message || "Failed to update media title" };
  }
}
