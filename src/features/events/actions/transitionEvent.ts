"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { EventStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

export async function transitionEvent(eventId: string, newStatus: EventStatus) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

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
          isValid = newStatus === "ONGOING" || newStatus === "COMPLETED";
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

    const updateData: any = { status: newStatus };
    if (currentStatus === "DRAFT" && newStatus !== "CANCELLED") {
      updateData.publishStatus = "PUBLISHED";
      updateData.publishedAt = new Date();
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData
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
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    revalidatePath("/admin/events");
    revalidateTag("events", "max"); revalidateTag("homepage", "max");
    revalidatePath("/events");
    revalidateTag("events", "max"); revalidateTag("homepage", "max");

    return { success: true, event: updatedEvent };
  } catch (error: any) {
    console.error("Transition event error:", error);
    return { error: error.message || "Failed to update event status" };
  }
}
