"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { EventStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function transitionEvent(eventId: string, newStatus: EventStatus) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("ADMIN") && !session.roles?.includes("CLUB_ADMIN") && !session.roles?.includes("BOARD_MEMBER"))) {
      return { error: "Unauthorized" };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return { error: "Event not found" };
    }

    const currentStatus = event.status;

    // Transition Validation Logic
    let isValid = false;

    if (newStatus === "CANCELLED") {
      // Can cancel draft, upcoming, or ongoing events
      isValid = ["DRAFT", "UPCOMING", "ONGOING"].includes(currentStatus);
    } else {
      switch (currentStatus) {
        case "DRAFT":
          isValid = newStatus === "UPCOMING";
          break;
        case "UPCOMING":
          isValid = newStatus === "ONGOING";
          break;
        case "ONGOING":
          isValid = newStatus === "COMPLETED";
          break;
        default:
          isValid = false;
      }
    }

    if (!isValid) {
      return { error: `Cannot transition event from ${currentStatus} to ${newStatus}` };
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status: newStatus }
    });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: `transition_${newStatus.toLowerCase()}`,
        entity: "event",
        entityId: eventId,
      }
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, event: updatedEvent };
  } catch (error: any) {
    console.error("Transition event error:", error);
    return { error: error.message || "Failed to update event status" };
  }
}
