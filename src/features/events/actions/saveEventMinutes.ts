"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function saveEventMinutes(eventId: string, minutes: string) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("ADMIN") && !session.roles?.includes("CLUB_ADMIN") && !session.roles?.includes("BOARD_MEMBER"))) {
      return { error: "Unauthorized" };
    }

    const updated = await prisma.eventMinutes.upsert({
      where: { eventId },
      update: { content: minutes },
      create: { eventId, content: minutes }
    });

    revalidatePath(`/admin/events/${eventId}`);
    return { success: true, event: updated };
  } catch (error: any) {
    console.error("Save event minutes error:", error);
    return { error: error.message || "Failed to save minutes" };
  }
}
