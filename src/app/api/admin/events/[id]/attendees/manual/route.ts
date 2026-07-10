import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";

function adminOnly(session: any) {
  return session && ((session.roles?.includes('SUPER_ADMIN') || session.roles?.includes('ADMIN') || session.roles?.includes('CLUB_ADMIN')));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { memberId } = await req.json();

    if (!memberId || !eventId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Create or find attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        eventId_memberId: {
          eventId,
          memberId
        }
      },
      update: {},
      create: {
        eventId,
        memberId,
        method: "MANUAL"
      }
    });

    return NextResponse.json(attendance);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
