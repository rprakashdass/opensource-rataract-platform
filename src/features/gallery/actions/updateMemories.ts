"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath } from "next/cache";

export async function updateMemories(data: {
  orderedIds?: string[];
  layout?: string;
  limit?: number;
  toggledMediaId?: string;
  toggledState?: boolean;
}) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const settings = await prisma.websiteSettings.findUnique({ where: { clubId: club.id } });
    const albumId = settings?.galleryAlbumId;

    if (!albumId) {
      return { error: "Memories album not found. Please upload a memory first." };
    }

    if (data.layout) {
      await prisma.websiteSettings.update({
        where: { clubId: club.id },
        data: { galleryLayout: data.layout }
      });
    }

    if (data.limit !== undefined) {
      const clampedLimit = Math.min(20, Math.max(1, Math.round(data.limit)));
      await prisma.websiteSettings.update({
        where: { clubId: club.id },
        data: { galleryLimit: clampedLimit }
      });
    }

    if (data.toggledMediaId !== undefined && data.toggledState !== undefined) {
      // Validate it belongs to this album
      const media = await prisma.media.findUnique({ where: { id: data.toggledMediaId } });
      if (!media || media.albumId !== albumId || media.clubId !== club.id) {
        return { error: "Media not found in the Memories album." };
      }
      await prisma.media.update({
        where: { id: data.toggledMediaId },
        data: { showOnHomepage: data.toggledState }
      });
    }

    if (data.orderedIds && data.orderedIds.length > 0) {
      // Verify all IDs belong to the Memories album of the current club
      const validMediaCount = await prisma.media.count({
        where: {
          id: { in: data.orderedIds },
          albumId,
          clubId: club.id
        }
      });

      if (validMediaCount !== data.orderedIds.length) {
        return { error: "Invalid media IDs provided for reordering." };
      }

      // Reorder persistence must be one transaction
      await prisma.$transaction(
        data.orderedIds.map((id, index) => 
          prisma.media.update({
            where: { id },
            data: { sortOrder: index + 1 } // Using 1-based index for order
          })
        )
      );
    }

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery/memories");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update memories:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}
