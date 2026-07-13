import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  // Default to 1 hour if no end time is provided
  const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 60 * 60 * 1000);

  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatGCalDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const gcalDates = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
  const gcalTitle = encodeURIComponent(event.title);
  const gcalLocation = encodeURIComponent(event.location || event.meetingLink || "");
  const gcalDetails = encodeURIComponent(event.description || "");

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${gcalDates}&details=${gcalDetails}&location=${gcalLocation}`;

  return NextResponse.redirect(gcalUrl);
}
