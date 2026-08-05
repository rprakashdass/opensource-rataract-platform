import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { revalidateTag, revalidatePath } from "next/cache";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    const data = await req.json();
    const { id, title, slug, description, location, meetingLink, startDate, endDate, status, initiativeId, visibility, registrationEnabled, isFeatured, bannerMediaId, posterMediaId, publishStatus, seekingSponsorship, sponsorshipGoal, sponsorshipPitch, beneficiaries, objectives, volunteerHours, team } = data;

    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    // Admins manage any event; chairs/co-chairs only their own.
    if (!session || !(await canManageEvent(session, id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const isAdmin = canManageClub(session);

    // Publish state is admin-only — a chair's edit must never change it.
    const existing = await prisma.event.findUnique({ where: { id }, select: { publishStatus: true, publishedAt: true } });
    if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    const effPublishStatus = isAdmin ? publishStatus : existing.publishStatus;
    const effPublishedAt = isAdmin ? (publishStatus === "PUBLISHED" ? new Date() : null) : existing.publishedAt;

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        location: location || null,
        meetingLink: meetingLink || null,
        startTime: startDate ? new Date(startDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endTime: endDate ? new Date(endDate) : null,
        status: effPublishStatus === "DRAFT" ? "DRAFT" : (() => {
          if (status === "CANCELLED" || status === "ONGOING" || status === "COMPLETED") return status;
          if (!startDate) return status;
          const start = new Date(startDate);
          // Changed 4 hours to 24 hours (24 * 60 * 60 * 1000) for events
          const end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
          return end < new Date() ? "COMPLETED" : "UPCOMING";
        })(),
        projectId: initiativeId,
        visibility,
        registrationEnabled,
        isFeatured,
        bannerMediaId: bannerMediaId || null,
        posterMediaId: posterMediaId || null,
        publishStatus: effPublishStatus,
        publishedAt: effPublishedAt,
        seekingSponsorship: seekingSponsorship || false,
        sponsorshipGoal: sponsorshipGoal || null,
        sponsorshipPitch: sponsorshipPitch || null,
        beneficiaries: beneficiaries || null,
        ...(objectives !== undefined ? { objectives: Array.isArray(objectives) ? objectives.filter(Boolean) : [] } : {}),
        ...(volunteerHours !== undefined ? { volunteerHours: volunteerHours != null ? Number(volunteerHours) : null } : {}),
      },
    });

    // Sync team roles (chair / co-chair / volunteers). Replace the set; the
    // @@unique([eventId, memberId]) means one role per member, so dedupe first.
    if (Array.isArray(team)) {
      const seen = new Set<string>();
      const rows = team
        .filter((t: any) => t?.memberId && !seen.has(t.memberId) && seen.add(t.memberId))
        .map((t: any) => ({ eventId: id, memberId: t.memberId, role: t.role }));
      await prisma.$transaction([
        prisma.eventMember.deleteMany({ where: { eventId: id } }),
        ...(rows.length ? [prisma.eventMember.createMany({ data: rows, skipDuplicates: true })] : []),
      ]);
    }

    const linkedMediaIds = [bannerMediaId, posterMediaId].filter(Boolean) as string[];
    if (linkedMediaIds.length > 0) {
      await prisma.media.updateMany({
        where: { id: { in: linkedMediaIds } },
        data: { eventId: event.id }
      });
    }

    revalidateTag("events", "max");
    revalidateTag("homepage", "max");
    revalidateTag("sponsorship-causes", "max");
    revalidatePath("/partner");

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.roles?.some((role: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN"].includes(role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete event" }, { status: 500 });
  }
}
