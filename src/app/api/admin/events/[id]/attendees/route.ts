import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function adminOnly(session: any) {
  return session && (session.role === "ADMIN" || session.role === "CLUB_ADMIN");
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { attendeeId, attended } = await req.json();

    if (!attendeeId) {
      return NextResponse.json({ error: "Attendee ID required" }, { status: 400 });
    }

    const updatedAttendee = await prisma.eventAttendee.update({
      where: { id: attendeeId },
      data: {
        attendedAt: attended ? new Date() : null
      }
    });

    return NextResponse.json(updatedAttendee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
