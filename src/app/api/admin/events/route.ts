import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.roles?.some((role: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN"].includes(role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { id, title, slug, description, location, startDate, endDate, status, initiativeId, visibility, registrationEnabled, isFeatured } = data;

    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        location,
        startTime: startDate ? new Date(startDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endTime: endDate ? new Date(endDate) : null,
        status,
        projectId: initiativeId,
        visibility,
        registrationEnabled,
        isFeatured
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}
