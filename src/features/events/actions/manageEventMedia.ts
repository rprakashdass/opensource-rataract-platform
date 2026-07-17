"use server";

import { getSession , canManageClub } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/features/storage/googleDrive";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function toggleMediaFeature(mediaId: string, isFeatured: boolean, eventId: string) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    await prisma.media.update({
      where: { id: mediaId },
      data: { isFeatured }
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePublicRoutes();
    
    return { success: true };
  } catch (error: any) {
    console.error("Toggle media feature error:", error);
    return { error: error.message || "Failed to update media" };
  }
}

export async function setEventMediaRole(mediaId: string, eventId: string, role: "banner" | "poster") {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    await prisma.event.update({
      where: { id: eventId },
      data: role === "banner" ? { bannerMediaId: mediaId } : { posterMediaId: mediaId },
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePublicRoutes();

    return { success: true };
  } catch (error: any) {
    console.error("Set event media role error:", error);
    return { error: error.message || "Failed to update media" };
  }
}

export async function deleteEventMedia(mediaId: string, eventId: string) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

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
    revalidatePublicRoutes();
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete media error:", error);
    return { error: error.message || "Failed to delete media" };
  }
}
