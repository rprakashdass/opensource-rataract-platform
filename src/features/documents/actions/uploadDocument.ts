"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { DocumentType } from "@prisma/client";
import { getCurrentClub } from "@/lib/club";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "png", "jpg", "jpeg", "webp"];

export async function uploadDocument(formData: FormData) {
  try {
    const session = await getSession();
    const isAdmin = session?.roles && session.roles.some((r: string) => 
      ["SUPER_ADMIN", "ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN", "FINANCE_VIEWER", "EVENTS_ADMIN", "CONTENT_ADMIN"].includes(r)
    );
    if (!session || !isAdmin) return { error: "Unauthorized" };

    const file = formData.get("file") as File;
    const displayName = formData.get("displayName") as string;
    const type = formData.get("type") as DocumentType;
    const linkedEntityType = formData.get("linkedEntityType") as string | null;
    const linkedEntityId = formData.get("linkedEntityId") as string | null;

    if (!file || !displayName || !type) {
      return { error: "Missing required fields" };
    }

    if (file.size > MAX_SIZE_BYTES) {
      return { error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max limit is 10MB.` };
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return { error: `Unsupported file type ".${fileExt}". Allowed formats: ${ALLOWED_EXTENSIONS.join(", ")}` };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${club.id}/${type.toLowerCase()}/${fileName}`;

    const supabase = getSupabaseAdmin();
    
    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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

    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileUrl: publicUrlData.publicUrl,
        displayName,
        type,
        uploadedBy: session.id,
        linkedEntityType,
        linkedEntityId,
        clubId: club.id
      }
    });

    return { success: true, document };
  } catch (error: any) {
    console.error("Document upload error:", error);
    return { error: error.message || "Failed to process upload" };
  }
}
