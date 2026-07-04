import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";

function adminOnly(session: any) {
  return session && (session.role === "ADMIN" || session.role === "CLUB_ADMIN");
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        attendees: {
          include: { member: { include: { user: true } } }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (!meeting.minutes && !meeting.minutesUrl) {
      return NextResponse.json({ error: "No minutes saved or attached for this meeting yet." }, { status: 400 });
    }

    const attendees = meeting.attendees.filter(a => a.attendedAt);

    if (attendees.length === 0) {
      return NextResponse.json({ error: "No one is marked as having attended this meeting." }, { status: 400 });
    }

    for (const attendee of attendees) {
      if (attendee.member.user?.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Meeting Minutes: ${meeting.title}</h2>
            <p>Hi ${attendee.member.name},</p>
            <p>Thank you for attending the meeting! Here are the minutes:</p>
            <hr />
            <div style="white-space: pre-wrap;">${meeting.minutes}</div>
            <hr />
            <br/>
            <p>Best,<br/>Rotaract Club</p>
          </div>
        `;

        const mailOptions: any = {
          to: attendee.member.user.email,
          subject: `Meeting Minutes: ${meeting.title}`,
          html: emailHtml
        };

        if (meeting.minutesUrl) {
          mailOptions.attachments = [
            {
              filename: "Meeting_Minutes.pdf",
              path: meeting.minutesUrl
            }
          ];
        }

        sendEmail(mailOptions).catch(err => console.error("Failed to send meeting minutes mail:", err));
      }
    }

    return NextResponse.json({ success: true, count: attendees.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
