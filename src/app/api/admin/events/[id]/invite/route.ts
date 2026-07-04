import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
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
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const members = await prisma.member.findMany({
      include: { user: true }
    });

    const startDate = new Date(event.startDate);

    // Send emails
    for (const member of members) {
      if (member.user?.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You're invited: ${event.title}</h2>
            <p>Hi ${member.name},</p>
            <p>Please find the calendar invite attached for our upcoming event!</p>
            <p><strong>When:</strong> ${startDate.toLocaleString()}</p>
            <p><strong>Where:</strong> ${event.location || "TBD"}</p>
            <br/>
            <p>See you there!<br/>Rotaract Club</p>
          </div>
        `;

        sendEmail({
          to: member.user.email,
          subject: `Invite: ${event.title}`,
          html: emailHtml
        }).catch(err => console.error("Failed to send calendar invite:", err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
