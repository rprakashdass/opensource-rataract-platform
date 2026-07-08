"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function attachMedia(mediaId: string, data: {
  eventId?: string | null;
  projectId?: string | null;
  albumId?: string | null;
  isCover?: boolean;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    if (data.isCover) {
      if (data.eventId) {
        await prisma.media.updateMany({
          where: { eventId: data.eventId, isCover: true },
          data: { isCover: false }
        });
      }
      if (data.projectId) {
        await prisma.media.updateMany({
          where: { projectId: data.projectId, isCover: true },
          data: { isCover: false }
        });
      }
      if (data.albumId) {
        // Handle album cover logic if needed, album has coverMediaId
        await prisma.album.update({
           where: { id: data.albumId },
           data: { coverMediaId: mediaId }
        });
      }
    }

    const media = await prisma.media.update({
      where: { id: mediaId },
      data: {
         eventId: data.eventId !== undefined ? data.eventId : undefined,
         projectId: data.projectId !== undefined ? data.projectId : undefined,
         albumId: data.albumId !== undefined ? data.albumId : undefined,
         isCover: data.isCover !== undefined ? data.isCover : undefined,
      }
    });

    return { success: true, media };
  } catch (error: any) {
    console.error("Media attach error:", error);
    return { error: error.message || "Failed to process attach" };
  }
}
