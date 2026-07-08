"use server";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function updateEventImpact(eventId: string, data: { volunteerHours?: number; fundsRaised?: number; impactMetrics?: any }) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        members: true
      }
    });

    if (!event) return { error: "Event not found" };

    const isSuperAdmin = session.roles?.includes("SUPER_ADMIN");
    const isClubAdmin = session.roles?.includes("CLUB_ADMIN");
    const isEventChair = event.members.some((member: any) => member.memberId === session.id && member.role === "CHAIR");

    if (!isSuperAdmin && !isClubAdmin && !isEventChair) {
      return { error: "You do not have permission to update impact metrics for this event." };
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        volunteerHours: data.volunteerHours,
        fundsRaised: data.fundsRaised,
        impactMetrics: data.impactMetrics || null,
      }
    });

    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    return { success: true, event: updatedEvent };
  } catch (error: any) {
    console.error("Failed to update event impact:", error);
    return { error: error.message || "An error occurred while updating impact." };
  }
}
