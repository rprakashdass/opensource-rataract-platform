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

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendees: {
          include: { member: { include: { user: true } } }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.minutes) {
      return NextResponse.json({ error: "No minutes saved for this event yet." }, { status: 400 });
    }

    const attendees = event.attendees.filter(a => a.attendedAt); // Only those who attended

    if (attendees.length === 0) {
      return NextResponse.json({ error: "No one is marked as having attended this event." }, { status: 400 });
    }

    for (const attendee of attendees) {
      if (attendee.member.user?.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Meeting Minutes: ${event.title}</h2>
            <p>Hi ${attendee.member.name},</p>
            <p>Thank you for attending the event! Here are the meeting minutes:</p>
            <hr />
            <div style="white-space: pre-wrap;">${event.minutes}</div>
            <hr />
            <br/>
            <p>Best,<br/>Rotaract Club</p>
          </div>
        `;

        sendEmail({
          to: attendee.member.user.email,
          subject: `Meeting Minutes: ${event.title}`,
          html: emailHtml
        }).catch(err => console.error("Failed to send minutes mail:", err));
      }
    }

    return NextResponse.json({ success: true, count: attendees.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
