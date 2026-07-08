import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCalendarEvent } from "@/lib/calendar";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { startDate: "desc" },
      include: {
        club: true,
      }
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      clubId,
      title,
      description,
      startDate,
      endDate,
      location,
      meetingLink,
      agendaUrl,
      type,
      status,
      emailSubject,
      emailBody,
      agendaContent,
      visibility
    } = data;

    if (!clubId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let calendarEventId = null;
    if (startDate) {
      // Call calendar stub
      calendarEventId = await createCalendarEvent({
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        meetingLink,
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        clubId,
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location,
        meetingLink,
        agendaUrl,
        type,
        status: status || "DRAFT",
        emailSubject,
        emailBody,
        agendaContent,
        calendarEventId,
        visibility: visibility || "PUBLIC",
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
