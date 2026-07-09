"use server";

import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { getCurrentClub } from "@/lib/club";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadAsset(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const file = formData.get("file") as File | null;
    if (!file) return { error: "No file provided" };
    if (file.size > MAX_SIZE_BYTES) return { error: "File is too large (max 5MB)" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${club.id}/assets/${fileName}`;

    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("rotaract-media")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return { error: "Failed to upload file to storage" };
    }

    const { data } = supabase.storage.from("rotaract-media").getPublicUrl(filePath);
    return { success: true, url: data.publicUrl };
  } catch (error: any) {
    console.error("Asset upload error:", error);
    return { error: error.message || "Failed to upload file" };
  }
}
