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
      minutesUrl,
      minutesContent,
      visibility,
      specificRecipientIds
    } = data;

    if (!clubId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let calendarEventId = null;
    if (startDate) {
      // Calendar sync is a secondary feature — never let a misconfigured
      // Google Calendar integration (bad service-account JSON, missing
      // calendar ID/permissions) block creating the announcement itself.
      try {
        calendarEventId = await createCalendarEvent({
          title,
          description,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
          location,
          meetingLink,
        });
      } catch (calendarError) {
        console.error("Calendar sync failed (non-fatal):", calendarError);
      }
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
        minutesUrl,
        minutesContent,
        calendarEventId,
        visibility: visibility || "PUBLIC",
        specificRecipientIds: specificRecipientIds || [],
      }
    });

    return NextResponse.json(announcement);
  } catch (error: any) {
    console.error("Failed to create announcement:", error);
    const detail =
      error?.code === "P2002"
        ? "An announcement with conflicting unique data already exists."
        : error?.code
          ? `Database error (${error.code}): ${error.meta?.cause || error.message}`
          : error?.message || "Unknown error";
    return NextResponse.json({ error: `Failed to create announcement — ${detail}` }, { status: 500 });
  }
}
