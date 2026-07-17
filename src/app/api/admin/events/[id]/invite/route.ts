import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { getEventInviteEmailHtml } from "@/lib/email-templates";

function adminOnly(session: any) {
  return session && ((session.roles?.includes('SUPER_ADMIN') || session.roles?.includes('ADMIN') || session.roles?.includes('CLUB_ADMIN')));
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

    const club = await prisma.club.findFirst();
    const startDate = new Date(event.startDate);

    // Send emails
    const emailPromises = members.map(member => {
      const targetEmail = member.email || member.user?.email;
      if (!targetEmail) return Promise.resolve();

      const memberName = member.name || "Member";
      const textBody = `Hi ${memberName},\n\nYou are cordially invited to attend our upcoming event: ${event.title}.\n\nDate & Time: ${startDate.toLocaleString()}\nLocation: ${event.location || "TBD"}\n\nSee you there!`;

      return sendEmail({
        to: targetEmail,
        subject: `Invite: ${event.title}`,
        text: textBody,
        html: getEventInviteEmailHtml(event, memberName, club)
      }).then(res => {
        if (!res.success) {
          console.error("Resend API failed to send to", targetEmail, ":", res.error);
        }
      }).catch(err => console.error("Failed to send calendar invite to", targetEmail, ":", err));
    });

    await Promise.all(emailPromises);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
