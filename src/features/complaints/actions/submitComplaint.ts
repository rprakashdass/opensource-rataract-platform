"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";

export type ComplaintCategory = "COMPLAINT" | "FEEDBACK" | "SUGGESTION" | "OTHER";

export async function submitComplaint(data: {
  category: ComplaintCategory;
  message: string;
  attachmentUrl?: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "You must be logged in to submit a complaint." };
    }

    const club = await getCurrentClub();
    if (!club) {
      return { error: "Club not found." };
    }

    const message = data.message.trim();
    if (message.length < 20) {
      return { error: "Message must be at least 20 characters." };
    }
    if (message.length > 1000) {
      return { error: "Message must be under 1000 characters." };
    }

    const validCategories: ComplaintCategory[] = ["COMPLAINT", "FEEDBACK", "SUGGESTION", "OTHER"];
    if (!validCategories.includes(data.category)) {
      return { error: "Invalid category." };
    }

    // Intentionally no user reference stored — anonymous by design
    await prisma.anonComplaint.create({
      data: {
        clubId: club.id,
        category: data.category,
        message,
        attachmentUrl: data.attachmentUrl,
        status: "OPEN",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[submitComplaint] Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
