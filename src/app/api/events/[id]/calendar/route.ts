import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as ics from "ics";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { club: true }
  });

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  if (!event.startDate) {
    return new NextResponse("Event has no start date", { status: 400 });
  }

  const start = new Date(event.startDate);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const icsEvent: ics.EventAttributes = {
    start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
    end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
    title: event.title,
    description: event.description || "",
    location: event.location || event.meetingLink || "",
    status: "CONFIRMED",
    busyStatus: "BUSY",
    organizer: event.club ? {
      name: event.club.name,
      email: event.club.email || "noreply@club.com"
    } : undefined
  };

  const { error, value } = ics.createEvent(icsEvent);

  if (error || !value) {
    return new NextResponse("Failed to generate calendar file", { status: 500 });
  }

  return new NextResponse(value, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="event-${event.id}.ics"`,
    },
  });
}
