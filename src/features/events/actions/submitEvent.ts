"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { revalidatePath } from "next/cache";

/**
 * A chair requests publish approval for their DRAFT event. Records the request
 * timestamp; admins surface it via the pending badge on /admin/events and are
 * the only ones who can actually publish.
 */
export async function submitEventForReview(eventId: string) {
  try {
    const session = await getSession();
    if (!session || !(await canManageEvent(session, eventId))) {
      return { error: "Unauthorized" };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { publishStatus: true },
    });
    if (!event) return { error: "Event not found" };
    if (event.publishStatus !== "DRAFT") {
      return { error: "Only draft events can be submitted for approval." };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { submittedForReviewAt: new Date() },
    });

    revalidatePath(`/member/events/${eventId}/manage`);
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to submit for approval" };
  }
}
