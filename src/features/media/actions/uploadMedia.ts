"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { MediaType, MediaUsage } from "@prisma/client";
import { getCurrentClub } from "@/lib/club";

export async function uploadMedia(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const caption = formData.get("caption") as string | null;
    const altText = formData.get("altText") as string | null;
    const type = (formData.get("type") as MediaType) || "IMAGE";
    const usage = (formData.get("usage") as MediaUsage) || "GALLERY";
    const isCover = formData.get("isCover") === "true";
    const eventId = formData.get("eventId") as string | null;
    const projectId = formData.get("projectId") as string | null;
    const albumId = formData.get("albumId") as string | null;

    if (!file && type !== "VIDEO_LINK") {
      return { error: "Missing file" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    let publicUrl = "";

    if (type === "IMAGE" || type === "DOCUMENT") {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${club.id}/media/${type.toLowerCase()}/${fileName}`;

      const supabase = getSupabaseAdmin();
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('rotaract-media')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return { error: "Failed to upload file to storage" };
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('rotaract-media')
        .getPublicUrl(filePath);
        
      publicUrl = publicUrlData.publicUrl;
    } else if (type === "VIDEO_LINK") {
       publicUrl = formData.get("url") as string;
       if (!publicUrl) return { error: "URL is required for video links" };
    }

    if (isCover) {
       // if this is set as cover, unset other covers for the entity
       if (eventId) {
          await prisma.media.updateMany({
             where: { eventId, isCover: true },
             data: { isCover: false }
          });
       }
       if (projectId) {
          await prisma.media.updateMany({
             where: { projectId, isCover: true },
             data: { isCover: false }
          });
       }
    }

    const media = await prisma.media.create({
      data: {
        url: publicUrl,
        title: title || (file ? file.name : "Video Link"),
        caption,
        altText,
        type,
        usage,
        isCover,
        eventId,
        projectId,
        albumId,
        uploadedById: session.id,
        clubId: club.id
      }
    });

    return { success: true, media };
  } catch (error: any) {
    console.error("Media upload error:", error);
    return { error: error.message || "Failed to process upload" };
  }
}
