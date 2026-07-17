"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageWebsite } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";
import { getCurrentClub } from "@/lib/club";

export async function saveWebsiteSettings(data: any) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) { return { error: "Unauthorized" }; }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    // Upsert WebsiteSettings
    const settings = await prisma.websiteSettings.upsert({
      where: { clubId: club.id },
      update: data,
      create: {
        clubId: club.id,
        ...data
      }
    });

    revalidatePublicRoutes();

    return { success: true, data: settings };
  } catch (error: any) {
    console.error("Failed to save website settings:", error);
    return { error: error.message || "Failed to save settings" };
  }
}
