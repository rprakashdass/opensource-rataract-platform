"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function deleteMedia(mediaId: string) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) return { error: "Unauthorized" };

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { club: true }
    });

    if (!media) return { error: "Media not found" };

    // Ideally, check user's permission to delete in the club

    if (media.type === "IMAGE" || media.type === "DOCUMENT") {
      // Extract file path from URL
      const urlObj = new URL(media.url);
      const parts = urlObj.pathname.split('/');
      // Rotaract-media is the bucket, so the path is after the bucket name
      const bucketIndex = parts.indexOf('rotaract-media');
      if (bucketIndex !== -1) {
        const filePath = parts.slice(bucketIndex + 1).join('/');
        
        const supabase = getSupabaseAdmin();
        const { error: deleteError } = await supabase
          .storage
          .from('rotaract-media')
          .remove([filePath]);
          
        if (deleteError) {
          console.error("Supabase delete error:", deleteError);
          // Non-fatal, we can still delete the DB record, but maybe log it
        }
      }
    }

    await prisma.media.delete({
      where: { id: mediaId }
    });

    revalidatePath("/admin/gallery");
    if (media.albumId) revalidatePath(`/admin/gallery/albums/${media.albumId}`);
    revalidatePublicRoutes();

    return { success: true };
  } catch (error: any) {
    console.error("Media delete error:", error);
    return { error: error.message || "Failed to process delete" };
  }
}
