"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageWebsite } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";

export async function saveWebsiteSettings(data: any) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) { return { error: "Unauthorized" }; }

    const member = await prisma.member.findUnique({
      where: { userId: session.id }
    });

    if (!member) {
      return { error: "User not found" };
    }

    // Upsert WebsiteSettings
    const settings = await prisma.websiteSettings.upsert({
      where: { clubId: member.clubId },
      update: data,
      create: {
        clubId: member.clubId,
        ...data
      }
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/website");
    revalidateTag("website-settings", "max");
    revalidateTag("layout", "max");
    revalidateTag("club", "max");
    revalidateTag("homepage", "max");

    return { success: true, data: settings };
  } catch (error: any) {
    console.error("Failed to save website settings:", error);
    return { error: error.message || "Failed to save settings" };
  }
}
