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
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const members = await prisma.member.findMany({
      include: { user: true }
    });

    const startDate = new Date(meeting.date);

    for (const member of members) {
      if (member.user?.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Meeting Invite: ${meeting.title}</h2>
            <p>Hi ${member.name},</p>
            <p>You are invited to an upcoming club meeting!</p>
            <p><strong>When:</strong> ${startDate.toLocaleString()}</p>
            <p><strong>Location:</strong> ${meeting.location || "TBD"}</p>
            ${meeting.meetingLink ? `<p><strong>Online Link:</strong> <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></p>` : ""}
            ${meeting.agenda ? `<p><strong>Agenda:</strong><br/><pre style="font-family: sans-serif; white-space: pre-wrap;">${meeting.agenda}</pre></p>` : ""}
            <br/>
            <p>See you there!<br/>Rotaract Club</p>
          </div>
        `;

        const mailOptions: any = {
          to: member.user.email,
          subject: `Meeting Invite: ${meeting.title}`,
          html: emailHtml
        };

        if (meeting.agendaUrl) {
          mailOptions.attachments = [
            {
              filename: "Agenda.pdf",
              path: meeting.agendaUrl
            }
          ];
        }

        sendEmail(mailOptions).catch(err => console.error("Failed to send meeting invite:", err));
      }
    }

    return NextResponse.json({ success: true, count: members.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
