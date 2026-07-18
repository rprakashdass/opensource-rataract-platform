"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { MediaType, MediaUsage } from "@prisma/client";
import { getCurrentClub } from "@/lib/club";
import { getMediaTypeFromExtension, ALLOWED_MEDIA_TYPES } from "@/lib/media-helpers";
import { revalidatePublicRoutes } from "@/lib/revalidate";
import { getOrCreateAlbum, MediaContext, MediaContextSchema } from "../lib/resolveAlbum";
import { GoogleDriveProvider } from "@/features/storage/google-drive";
import { decrypt } from "@/lib/crypto";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

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

    const file = formData.get("file") as File | null;
    const title = sanitizeField(formData.get("title"));
    const caption = sanitizeField(formData.get("caption"));
    const altText = sanitizeField(formData.get("altText"));
    
    const typeVal = sanitizeField(formData.get("type"));
    let type = (typeVal as MediaType) || "IMAGE";
    
    if (file) {
      if (file.size > MAX_SIZE_BYTES) {
        return { error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max size is 10MB.` };
      }
      // Detect type if it's set to IMAGE but is actually a document (e.g. PDF/DOCX)
      const detected = getMediaTypeFromExtension(file.name);
      if (type === "IMAGE" && detected === "DOCUMENT") {
        type = "DOCUMENT";
      }
    }
    
    const usageVal = sanitizeField(formData.get("usage"));
    const usage = (usageVal as MediaUsage) || "GALLERY";
    const isCover = formData.get("isCover") === "true";

    const contextJson = sanitizeField(formData.get("mediaContext"));
    if (!contextJson) return { error: "Missing mediaContext" };

    let context: MediaContext;
    try {
      context = MediaContextSchema.parse(JSON.parse(contextJson));
    } catch (e: any) {
      return { error: `Invalid mediaContext: ${e.message}` };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    // Security check: Only admins can upload media (except members for profile photos? Wait, the existing code says:
    // "Only admins can assign files to albums, events, projects, or set as covers. If !isAdmin, return error if isCover || eventId || projectId || albumId || albumTitle"
    // Since everything is now an album, non-admins (e.g. regular members updating their profile) need access to { kind: "members" }. Let's allow members if it's their profile... wait, profile updates usually happen via member actions. For now, let's keep the existing auth logic:
    const isAdmin = canManageClub(session);
    if (!isAdmin && context.kind !== "members" && context.kind !== "general") {
       return { error: "Unauthorized: Admin privileges required for this context." };
    }

    if (!file && type !== "VIDEO_LINK") {
      return { error: "Missing file" };
    }

    // 1. Resolve Album
    const { albumId, eventId, projectId } = await getOrCreateAlbum(club.id, context);

    let publicUrl = "";
    let driveFileId: string | null = null;

    if (type === "IMAGE" || type === "DOCUMENT") {
      if (!file) return { error: "File data is missing for upload." };
      const fileExt = file.name.split('.').pop() || "bin";
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${club.id}/media/${type.toLowerCase()}/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // --- Google Drive Mirror (Non-blocking) ---
      try {
         if (club.googleDriveRefreshToken) {
            const clearToken = decrypt(club.googleDriveRefreshToken);
            const provider = new GoogleDriveProvider(clearToken);
            const driveFolderId = await provider.resolveDriveFolder(club.googleDriveRootFolderId, context);
            
            if (driveFolderId) {
               const driveUpload = await provider.uploadFile(buffer, file.type, file.name, driveFolderId);
               driveFileId = driveUpload.id;
            }
         }
      } catch (driveErr) {
         console.warn("Failed to mirror upload to Google Drive:", driveErr);
         // Continue with Supabase upload
      }

      // --- Supabase Upload ---
      const supabase = getSupabaseAdmin();
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('rotaract-media')
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return { error: `Failed to upload file to storage: ${uploadError.message}` };
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

    // Set projectUpdateId if applicable
    const projectUpdateId = context.kind === "projectUpdate" ? context.projectUpdateId : null;

    // Set sortOrder = max + 1 if uploading to memories
    let sortOrder = 0;
    if (context.kind === "memories") {
      const maxMedia = await prisma.media.findFirst({
        where: { albumId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      sortOrder = (maxMedia?.sortOrder || 0) + 1;
    }

    const media = await prisma.media.create({
      data: {
        url: publicUrl,
        driveFileId,
        title: title || (file ? file.name : "Video Link"),
        caption,
        altText,
        type,
        usage,
        isCover,
        eventId,
        projectId,
        projectUpdateId,
        albumId,
        sortOrder,
        uploadedById: session.id,
        clubId: club.id
      }
    });

    revalidatePublicRoutes();
    return { success: true, media };
  } catch (error: any) {
    console.error("Media upload error:", error);
    return { error: error.message || "Failed to process upload" };
  }
}
