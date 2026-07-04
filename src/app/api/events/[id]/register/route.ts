import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { userId: session.id }
    });

    if (!member) {
      return NextResponse.json({ error: "Please complete your member profile before registering for events." }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if already registered
    const existingRegistration = await prisma.eventAttendee.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId: member.id
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ error: "You are already registered for this event." }, { status: 400 });
    }

    // Register
    const registration = await prisma.eventAttendee.create({
      data: {
        eventId,
        memberId: member.id
      }
    });

    // Update registeredCount (optional but good for tracking)
    await prisma.event.update({
      where: { id: eventId },
      data: { registeredCount: { increment: 1 } }
    });

    return NextResponse.json(registration);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
