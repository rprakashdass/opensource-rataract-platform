"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { MediaType, MediaUsage } from "@prisma/client";
import { getCurrentClub } from "@/lib/club";
import { getMediaTypeFromExtension, ALLOWED_MEDIA_TYPES } from "@/lib/media-helpers";
import { revalidatePublicRoutes } from "@/lib/revalidate";
import { getOrCreateAlbum, MediaContext, MediaContextSchema } from "../lib/resolveAlbum";
import { revalidatePath } from "next/cache";

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

    // Authorization by context. A signed-in member may upload to contexts that
    // are theirs to fill — their profile photo ("members"), general attachments,
    // and their own payment proof ("finance"). Event photos are open to the
    // event's chair/co-chair (canManageEvent) and to any member who registered
    // or attended that event (sharing their own photos), not just club admins.
    // Every other context (projects, gallery, covers) manages shared club
    // content and needs club-management rights.
    const SELF_SERVICE_KINDS = ["members", "general", "finance"];
    if (!SELF_SERVICE_KINDS.includes(context.kind) && !canManageClub(session)) {
      let allowedViaEvent = false;
      if (context.kind === "event") {
        allowedViaEvent = await canManageEvent(session, context.eventId);
        if (!allowedViaEvent && session.member?.id) {
          const participation = await prisma.event.findFirst({
            where: {
              id: context.eventId,
              OR: [
                { registrations: { some: { memberId: session.member.id } } },
                { attendance: { some: { memberId: session.member.id } } },
              ],
            },
            select: { id: true },
          });
          allowedViaEvent = !!participation;
        }
      }
      if (!allowedViaEvent) {
        return { error: `Uploading to “${context.kind}” requires club management access.` };
      }
    }

    if (!file && type !== "VIDEO_LINK") {
      return { error: "Missing file" };
    }

    // 1. Resolve Album
    const { albumId, eventId, projectId } = await getOrCreateAlbum(club.id, context);

    let publicUrl = "";

    if (type === "IMAGE" || type === "DOCUMENT") {
      if (!file) return { error: "File data is missing for upload." };
      const fileExt = file.name.split('.').pop() || "bin";
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${club.id}/media/${type.toLowerCase()}/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

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

    // revalidatePublicRoutes() only busts the static /events listing — the
    // individual /events/[slug] detail page is its own ISR-cached route.
    if (eventId) {
      const ev = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
      if (ev?.slug) revalidatePath(`/events/${ev.slug}`);
    }
    revalidatePublicRoutes();
    return { success: true, media };
  } catch (error: any) {
    console.error("Media upload error:", error);
    return { error: error.message || "Failed to process upload" };
  }
}
