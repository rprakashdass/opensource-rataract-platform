import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCalendarEvent, deleteCalendarEvent } from "@/lib/calendar";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        club: true,
      }
    });

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Failed to fetch announcement:", error);
    return NextResponse.json({ error: "Failed to fetch announcement" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      location,
      meetingLink,
      agendaUrl,
      minutesUrl,
      type,
      status,
      emailSubject,
      emailBody,
      agendaContent,
      minutesContent,
      visibility
    } = data;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        location: location !== undefined ? location : existing.location,
        meetingLink: meetingLink !== undefined ? meetingLink : existing.meetingLink,
        agendaUrl: agendaUrl !== undefined ? agendaUrl : existing.agendaUrl,
        minutesUrl: minutesUrl !== undefined ? minutesUrl : existing.minutesUrl,
        type: type !== undefined ? type : existing.type,
        status: status !== undefined ? status : existing.status,
        emailSubject: emailSubject !== undefined ? emailSubject : existing.emailSubject,
        emailBody: emailBody !== undefined ? emailBody : existing.emailBody,
        agendaContent: agendaContent !== undefined ? agendaContent : existing.agendaContent,
        minutesContent: minutesContent !== undefined ? minutesContent : existing.minutesContent,
        visibility: visibility !== undefined ? visibility : existing.visibility,
      },
    });

    if (announcement.calendarEventId && announcement.startDate) {
      await updateCalendarEvent(announcement.calendarEventId, {
        title: announcement.title,
        description: announcement.description,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        location: announcement.location,
        meetingLink: announcement.meetingLink,
      });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.announcement.findUnique({ where: { id } });
    
    if (existing?.calendarEventId) {
      await deleteCalendarEvent(existing.calendarEventId);
    }
    
    await prisma.announcement.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
