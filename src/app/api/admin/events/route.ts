import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";
import { getSession } from "@/lib/auth/session";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/calendar";

function validateEventPayload(data: any) {
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("Event title is required.");
  }
  if (typeof data.slug !== "string" || !data.slug.trim()) {
    throw new Error("Event slug is required.");
  }
  if (typeof data.location !== "string" || !data.location.trim()) {
    throw new Error("Event location is required.");
  }
  if (typeof data.startDate !== "string" || !data.startDate.trim()) {
    throw new Error("Event start date is required.");
  }

  return {
    initiativeId: typeof data.initiativeId === "string" && data.initiativeId.trim() ? data.initiativeId.trim() : null,
    title: data.title.trim(),
    slug: data.slug.trim(),
    description: typeof data.description === "string" ? data.description.trim() : null,
    location: data.location.trim(),
    startDate: new Date(data.startDate),
    endDate: typeof data.endDate === "string" && data.endDate.trim() ? new Date(data.endDate) : null,
    imageUrl: typeof data.imageUrl === "string" && data.imageUrl.trim() ? data.imageUrl.trim() : null,
    status: typeof data.status === "string" && data.status.trim() ? data.status.trim() : "upcoming",
    frequency: typeof data.frequency === "string" && data.frequency.trim() ? data.frequency.trim() : "ONCE",
  };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const payload = validateEventPayload(data);
    const club = await getOrCreateDefaultClub();

    let initiativeId = payload.initiativeId;

    if (!initiativeId && payload.frequency !== "ONCE") {
      // Create a recurring series (Initiative) automatically
      const newInitiative = await prisma.initiative.create({
        data: {
          clubId: club.id,
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          imageUrl: payload.imageUrl,
          frequency: payload.frequency as any,
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: "active",
        },
      });
      initiativeId = newInitiative.id;
    }

    const event = await prisma.event.create({
      data: {
        clubId: club.id,
        initiativeId: initiativeId,
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        location: payload.location,
        startDate: payload.startDate,
        endDate: payload.endDate,
        imageUrl: payload.imageUrl,
        status: payload.status,
      },
    });

    // Create Calendar Event
    let calendarEventId: string | null = null;
    try {
      calendarEventId = await createCalendarEvent({
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
      });
      
      if (calendarEventId) {
        await prisma.event.update({
          where: { id: event.id },
          data: { calendarEventId },
        });
      }
    } catch (err) {
      console.error("Failed to create calendar event:", err);
      // We don't fail the whole request if calendar creation fails
    }

    // Auto-add all active members to the event by default
    const members = await prisma.member.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    if (members.length > 0) {
      await prisma.eventAttendee.createMany({
        data: members.map((m) => ({
          eventId: event.id,
          memberId: m.id,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(event);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        initiative: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });
    return NextResponse.json(events);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || (!(session.roles?.includes('ADMIN') || session.roles?.includes('CLUB_ADMIN')))) {
      return NextResponse.json({ error: "Access Denied: Only Admins can delete events" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.calendarEventId) {
      try {
        await deleteCalendarEvent(event.calendarEventId);
      } catch (err) {
        console.error("Failed to delete calendar event:", err);
      }
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id } = data;
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        initiativeId: typeof data.initiativeId === "string" && data.initiativeId.trim() ? data.initiativeId.trim() : null,
        title: data.title,
        slug: data.slug,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        imageUrl: data.imageUrl,
        status: data.status,
      },
    });

    if (updated.calendarEventId) {
      try {
        await updateCalendarEvent(updated.calendarEventId, {
          title: updated.title,
          description: updated.description,
          location: updated.location,
          startDate: updated.startDate,
          endDate: updated.endDate,
        });
      } catch (err) {
        console.error("Failed to update calendar event:", err);
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Prisma error in admin events PUT API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
