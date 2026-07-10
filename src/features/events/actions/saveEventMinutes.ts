"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";

export async function saveEventMinutes(eventId: string, minutes: string) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    const updated = await prisma.eventMinutes.upsert({
      where: { eventId },
      update: { content: minutes },
      create: { eventId, content: minutes }
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    return { success: true, event: updated };
  } catch (error: any) {
    console.error("Save event minutes error:", error);
    return { error: error.message || "Failed to save minutes" };
  }
}
