"use server";

import { getSession , canManageClub } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/features/storage/googleDrive";
import { revalidatePath, revalidateTag } from "next/cache";

export async function uploadEventDriveMedia(eventId: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.member?.id) {
      return { error: "Unauthorized. Member profile required." };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) return { error: "Event not found." };
    if (!event.driveFolderId) return { error: "Google Drive folder is not configured for this event." };

    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided." };

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Drive
    const { driveFileId, driveUrl } = await uploadFile(
      buffer,
      file.type,
      file.name,
      event.driveFolderId 
    );

    // Create Media record
    await prisma.media.create({
      data: {
        clubId: event.clubId,
        eventId: event.id,
        driveFileId,
        url: driveUrl,
        title: file.name,
        type: "IMAGE",
        uploadedById: session.id,
        isFeatured: false,
      }
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    revalidatePath(`/admin/events/${eventId}`);
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    
    return { success: true };
  } catch (error: any) {
    console.error("Upload media error:", error);
    return { error: error.message || "Failed to upload media." };
  }
}
