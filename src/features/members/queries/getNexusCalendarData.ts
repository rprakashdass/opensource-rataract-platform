import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";

export type CalendarEntry = {
  id: string;
  title: string;
  date: string; // ISO date string "YYYY-MM-DD"
  endDate?: string;
  type: "EVENT" | "MEETING" | "PROJECT_START" | "PROJECT_END" | "BIRTHDAY";
  subtitle?: string;
  href?: string;
  color: string;
};

export async function getNexusCalendarData(): Promise<{ entries: CalendarEntry[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session) return { entries: [], error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { entries: [], error: "Club not found" };

    const entries: CalendarEntry[] = [];

    // ── 1. Events ─────────────────────────────────────────────────────────────
    const events = await prisma.event.findMany({
      where: {
        clubId: club.id,
        publishStatus: "PUBLISHED",
        status: { not: "CANCELLED" },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        startTime: true,
        endTime: true,
        type: true,
        location: true,
      },
      orderBy: { startDate: "asc" },
    });

    for (const e of events) {
      const isMeeting = e.type === "MEETING";
      entries.push({
        id: `event_${e.id}`,
        title: e.title,
        date: new Date(e.startTime).toISOString().split("T")[0],
        endDate: e.endTime ? new Date(e.endTime).toISOString().split("T")[0] : undefined,
        type: isMeeting ? "MEETING" : "EVENT",
        subtitle: e.location || e.type,
        href: `/member/events/${e.id}`,
        color: isMeeting ? "#F59E0B" : "#D41367",
      });
    }

    // ── 2. Announcements (Meetings & Notices) ─────────────────────────────────
    const announcements = await prisma.announcement.findMany({
      where: {
        clubId: club.id,
        publishStatus: "PUBLISHED",
        startDate: { not: null },
        type: { in: ["BOARD_MEETING", "CLUB_MEETING"] },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        type: true,
        location: true,
        meetingLink: true,
      },
      orderBy: { startDate: "asc" },
    });

    for (const ann of announcements) {
      if (!ann.startDate) continue;
      entries.push({
        id: `ann_${ann.id}`,
        title: ann.title,
        date: new Date(ann.startDate).toISOString().split("T")[0],
        type: "MEETING",
        subtitle: ann.location || (ann.meetingLink ? "Online" : ann.type),
        color: "#F59E0B",
      });
    }

    // ── 3. Projects ──────────────────────────────────────────────────────────
    const projects = await prisma.project.findMany({
      where: {
        clubId: club.id,
        publishStatus: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        status: true,
      },
      orderBy: { startDate: "asc" },
    });

    for (const p of projects) {
      entries.push({
        id: `proj_start_${p.id}`,
        title: `${p.title}`,
        date: new Date(p.startDate).toISOString().split("T")[0],
        endDate: p.endDate ? new Date(p.endDate).toISOString().split("T")[0] : undefined,
        type: "PROJECT_START",
        subtitle: `Project · ${p.status}`,
        href: `/member/projects/${p.id}`,
        color: "#10B981",
      });
    }

    // ── 4. Birthdays ──────────────────────────────────────────────────────────
    const members = await prisma.member.findMany({
      where: {
        clubId: club.id,
        isActive: true,
        dateOfBirth: { not: null },
      },
      select: {
        id: true,
        name: true,
        dateOfBirth: true,
        avatar: true,
      },
    });

    const currentYear = new Date().getFullYear();
    for (const m of members) {
      if (!m.dateOfBirth) continue;
      const dob = new Date(m.dateOfBirth);
      // Show birthday for current year and next year so they always appear upcoming
      for (const yr of [currentYear, currentYear + 1]) {
        const bday = new Date(yr, dob.getMonth(), dob.getDate());
        entries.push({
          id: `bday_${m.id}_${yr}`,
          title: `${m.name?.split(" ")[0]}'s Birthday 🎂`,
          date: bday.toISOString().split("T")[0],
          type: "BIRTHDAY",
          subtitle: m.name || "",
          color: "#8B5CF6",
        });
      }
    }

    // Sort all entries by date
    entries.sort((a, b) => a.date.localeCompare(b.date));

    return { entries };
  } catch (err: any) {
    console.error("getNexusCalendarData error:", err);
    return { entries: [], error: err.message };
  }
}
