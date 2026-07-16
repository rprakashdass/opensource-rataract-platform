"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentClub } from "@/lib/club";

export async function saveWebsiteMetrics(metrics: any[]) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    // Delete existing metrics for the club
    await prisma.websiteMetric.deleteMany({
      where: { clubId: club.id },
    });

    // Bulk create new metrics
    if (metrics.length > 0) {
      await prisma.websiteMetric.createMany({
        data: metrics.map((m, idx) => ({
          clubId: club.id,
          number: m.number,
          label: m.label,
          description: m.description || "",
          enabled: m.enabled !== false,
          displayOrder: idx,
        })),
      });
    }

    revalidatePath("/");
    revalidateTag("homepage", "max");
    revalidateTag("website-settings", "max");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to save website metrics:", error);
    return { error: error.message || "Failed to save metrics" };
  }
}
