"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { MediaType, MediaUsage } from "@prisma/client";
import { getCurrentClub } from "@/lib/club";

export async function uploadMedia(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.id) return { error: "Unauthorized" };

    const sanitizeField = (val: any) => {
      if (!val) return null;
      const str = String(val).trim();
      if (str === "" || str === "null" || str === "undefined") return null;
      return str;
    };

    const file = formData.get("file") as File;
    const title = sanitizeField(formData.get("title"));
    const caption = sanitizeField(formData.get("caption"));
    const altText = sanitizeField(formData.get("altText"));
    
    const typeVal = sanitizeField(formData.get("type"));
    let type = (typeVal as MediaType) || "IMAGE";
    if (file && !file.type.startsWith("image/") && type === "IMAGE") {
      type = "DOCUMENT";
    }
    
    const usageVal = sanitizeField(formData.get("usage"));
    const usage = (usageVal as MediaUsage) || "GALLERY";

    const isCover = formData.get("isCover") === "true";
    const eventId = sanitizeField(formData.get("eventId"));
    const projectId = sanitizeField(formData.get("projectId"));
    let albumId = sanitizeField(formData.get("albumId"));
    const albumTitle = sanitizeField(formData.get("albumTitle"));

    // Security check: Only admins can assign files to albums, events, projects, or set as covers.
    const isAdmin = canManageClub(session);
    if (!isAdmin) {
      if (isCover || eventId || projectId || albumId || albumTitle) {
        return { error: "Unauthorized: Admin privileges required for this action." };
      }
    }

    if (!file && type !== "VIDEO_LINK") {
      return { error: "Missing file" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    if (!albumId && albumTitle) {
      const album = await prisma.album.findFirst({
        where: { clubId: club.id, title: albumTitle, eventId: null, projectId: null },
      });
      albumId = album
        ? album.id
        : (await prisma.album.create({ data: { clubId: club.id, title: albumTitle } })).id;
    }

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
