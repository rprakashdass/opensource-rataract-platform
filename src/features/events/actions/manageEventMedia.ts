"use server";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/features/storage/googleDrive";
import { revalidatePath, revalidateTag } from "next/cache";

export async function toggleMediaFeature(mediaId: string, isFeatured: boolean, eventId: string) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("ADMIN") && !session.roles?.includes("CLUB_ADMIN") && !session.roles?.includes("BOARD_MEMBER"))) {
      return { error: "Unauthorized" };
    }

    await prisma.media.update({
      where: { id: mediaId },
      data: { isFeatured }
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    revalidatePath(`/events/${eventId}`);
    revalidateTag("events", "max"); revalidateTag("homepage", "max"); // revalidate public page if slug is used, maybe hard to revalidate by slug here. Revalidate all events is safer but expensive.
    revalidatePath(`/events`);
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    
    return { success: true };
  } catch (error: any) {
    console.error("Toggle media feature error:", error);
    return { error: error.message || "Failed to update media" };
  }
}

export async function deleteEventMedia(mediaId: string, eventId: string) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("ADMIN") && !session.roles?.includes("CLUB_ADMIN") && !session.roles?.includes("BOARD_MEMBER"))) {
      return { error: "Unauthorized" };
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) return { error: "Media not found" };

    // Delete from Drive if driveFileId exists
    if (media.driveFileId) {
      try {
        await deleteFile(media.driveFileId);
      } catch (err) {
        console.warn("Failed to delete from Google Drive, proceeding to delete DB record anyway.", err);
      }
    }

    await prisma.media.delete({
      where: { id: mediaId }
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    revalidatePath(`/events`);
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete media error:", error);
    return { error: error.message || "Failed to delete media" };
  }
}
