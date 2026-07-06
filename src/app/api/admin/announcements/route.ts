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
      sendInvite
    } = data;

    if (!clubId || !title || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Call calendar stub
    const calendarEventId = await createCalendarEvent({
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      meetingLink,
    });

    const announcement = await prisma.announcement.create({
      data: {
        clubId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        meetingLink,
        agendaUrl,
        type,
        sendInvite,
        calendarEventId,
      },
    });

    // Auto-assign all members of this club to the announcement
    const members = await prisma.member.findMany({
      where: { clubId }
    });

    if (members.length > 0) {
      // Send email invites if requested
      if (sendInvite) {
        const emails = members
          .map((m) => m.email)
          .filter((email): email is string => !!email);
          
        if (emails.length > 0) {
          const mailOptions = {
            to: emails,
            subject: `Announcement: ${announcement.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2>${announcement.title}</h2>
                <p>You have a new announcement from your club.</p>
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
          
          sendEmail(mailOptions).catch(err => console.error("Failed to send announcement invites:", err));
        }
      }
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
