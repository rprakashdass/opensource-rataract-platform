"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { eventSchema, EventFormData } from "../schemas/event.schema";
import { revalidatePath } from "next/cache";

export async function createEvent(data: EventFormData) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("ADMIN") && !session.roles?.includes("CLUB_ADMIN") && !session.roles?.includes("BOARD_MEMBER"))) {
      return { error: "Unauthorized" };
    }

    const parsed = eventSchema.parse(data);

    const club = await prisma.club.findFirst();
    if (!club) {
      return { error: "Club not found in database" };
    }

    const slug = parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const event = await prisma.event.create({
      data: {
        ...parsed,
        slug,
        tags: parsed.tags ? parsed.tags.split(',').map(t => t.trim()) : [],
        startDate: new Date(parsed.startTime),
        startTime: new Date(parsed.startTime),
        endTime: parsed.endTime ? new Date(parsed.endTime) : null,
        clubId: club.id,
      }
    });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "create",
        entity: "event",
        entityId: event.id,
      }
    });

    revalidatePath("/admin");
    revalidatePath("/events");

    return { success: true, event };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { error: error.message || "Failed to create event" };
  }
}
