import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCalendarEvent, deleteCalendarEvent } from "@/lib/calendar";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        club: true,
        attendees: {
          include: { member: true }
        }
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    const existing = await prisma.announcement.findUnique({ where: { id }, include: { attendees: { include: { member: true } } } });
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
      sendInvite
    } = data;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        location: location !== undefined ? location : existing.location,
        meetingLink: meetingLink !== undefined ? meetingLink : existing.meetingLink,
        agendaUrl: agendaUrl !== undefined ? agendaUrl : existing.agendaUrl,
        minutesUrl: minutesUrl !== undefined ? minutesUrl : existing.minutesUrl,
        type: type !== undefined ? type : existing.type,
        sendInvite: sendInvite !== undefined ? sendInvite : existing.sendInvite,
      },
    });

    if (announcement.calendarEventId) {
      await updateCalendarEvent(announcement.calendarEventId, {
        title: announcement.title,
        description: announcement.description,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        location: announcement.location,
        meetingLink: announcement.meetingLink,
      });
    }

    // If sendInvite transitioned from false to true, send emails
    if (sendInvite && !existing.sendInvite) {
      const emails = existing.attendees
        .map((a) => a.member.email)
        .filter((email): email is string => !!email);
        
      if (emails.length > 0) {
        const mailOptions = {
          to: emails,
          subject: `Update: Announcement: ${announcement.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>${announcement.title}</h2>
              <p>There is an update regarding this announcement.</p>
              ${announcement.description ? `<p>${announcement.description}</p>` : ""}
              <p><strong>Date:</strong> ${new Date(announcement.startDate).toLocaleString()}</p>
              ${announcement.location ? `<p><strong>Location:</strong> ${announcement.location}</p>` : ""}
              ${announcement.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${announcement.meetingLink}">${announcement.meetingLink}</a></p>` : ""}
            </div>
          `,
          attachments: announcement.agendaUrl
            ? [
                {
                  filename: "Agenda.pdf",
                  path: announcement.agendaUrl,
                },
              ]
            : undefined,
        };
        
        sendEmail(mailOptions).catch(err => console.error("Failed to send update invites:", err));
      }
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
