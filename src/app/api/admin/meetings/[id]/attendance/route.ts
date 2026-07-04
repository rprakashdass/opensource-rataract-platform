import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function adminOnly(session: any) {
  return session && (session.role === "ADMIN" || session.role === "CLUB_ADMIN");
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: meetingId } = await params;
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { memberId, attendedAt } = await req.json();

    const attendance = await prisma.meetingAttendance.create({
      data: {
        meetingId,
        memberId,
        attendedAt: attendedAt ? new Date(attendedAt) : null,
      },
    });

    return NextResponse.json(attendance);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Member is already on the attendance list" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
