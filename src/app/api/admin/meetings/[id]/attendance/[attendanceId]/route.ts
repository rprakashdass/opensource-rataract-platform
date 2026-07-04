import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function adminOnly(session: any) {
  return session && (session.role === "ADMIN" || session.role === "CLUB_ADMIN");
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; attendanceId: string }> }) {
  try {
    const { attendanceId } = await params;
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { attendedAt } = await req.json();

    const attendance = await prisma.meetingAttendance.update({
      where: { id: attendanceId },
      data: {
        attendedAt: attendedAt ? new Date(attendedAt) : null,
      },
    });

    return NextResponse.json(attendance);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
