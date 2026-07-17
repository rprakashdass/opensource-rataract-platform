"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function updateMedia(mediaId: string, data: {
  title?: string;
  caption?: string | null;
  altText?: string | null;
  displayOrder?: number;
}) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) return { error: "Unauthorized" };

    const media = await prisma.media.update({
      where: { id: mediaId },
      data
    });

    revalidatePublicRoutes();
    return { success: true, media };
  } catch (error: any) {
    console.error("Media update error:", error);
    return { error: error.message || "Failed to process update" };
  }
}
