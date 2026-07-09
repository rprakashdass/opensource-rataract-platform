"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function saveClubAbout(data: {
  aboutTitle?: string;
  aboutSubtitle?: string;
  missionStatement?: string;
  visionStatement?: string;
  aboutStory?: string;
  history?: string;
  parentClubName?: string;
  parentClubDescription?: string;
}) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    const member = await prisma.member.findUnique({
      where: { userId: session.id }
    });

    if (!member) return { error: "Member not found" };

    // Build update payload (ignore empty strings - treat them as intentional clear)
    const club = await prisma.club.update({
      where: { id: member.clubId },
      data: {
        aboutTitle: data.aboutTitle || null,
        aboutSubtitle: data.aboutSubtitle || null,
        missionStatement: data.missionStatement || null,
        visionStatement: data.visionStatement || null,
        aboutStory: data.aboutStory || null,
        history: data.history || null,
        parentClubName: data.parentClubName || null,
        parentClubDescription: data.parentClubDescription || null,
      }
    });

    revalidatePath("/about");
    revalidatePath("/admin/website/about");
    revalidatePath("/");

    return { success: true, club };
  } catch (error: any) {
    console.error("Failed to save club about:", error);
    return { error: error.message || "Failed to save" };
  }
}
