import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function adminOnly(session: any) {
  return session && ((session.roles?.includes('ADMIN') || session.roles?.includes('CLUB_ADMIN')));
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

    // Check if member already registered
    const existing = await prisma.eventAttendee.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId
        }
      }
    });

    if (existing) {
      // Just mark attended if already registered
      const updated = await prisma.eventAttendee.update({
        where: { id: existing.id },
        data: { attendedAt: new Date() }
      });
      return NextResponse.json(updated);
    }

    // Create registration and mark attended
    const newAttendee = await prisma.eventAttendee.create({
      data: {
        eventId,
        memberId,
        attendedAt: new Date()
      }
    });

    // Update registered count
    await prisma.event.update({
      where: { id: eventId },
      data: { registeredCount: { increment: 1 } }
    });

    return NextResponse.json(newAttendee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
