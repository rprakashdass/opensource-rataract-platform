import { prisma } from "@/lib/prisma";

export interface MonthBirthday {
  id: string;
  name: string | null;
  avatar: string | null;
  dateOfBirth: Date;
  day: number;
  isToday: boolean;
}

export interface MonthEvent {
  id: string;
  title: string;
  startTime: Date;
  slug: string;
}

/**
 * Birthdays and events falling in the current calendar month, scoped to a club.
 * Postgres/Prisma has no month-only filter for a DateTime column, so birthdays
 * are fetched with `not: null` and filtered/sorted in JS by month and day.
 */
export async function getThisMonthHighlights(clubId: string) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const startOfMonth = new Date(now.getFullYear(), currentMonth, 1);
  const startOfNextMonth = new Date(now.getFullYear(), currentMonth + 1, 1);

  const [membersWithDob, events] = await Promise.all([
    prisma.member.findMany({
      where: { clubId, dateOfBirth: { not: null }, membershipStatus: "ACTIVE" },
      select: { id: true, name: true, avatar: true, dateOfBirth: true },
    }),
    prisma.event.findMany({
      where: {
        clubId,
        startTime: { gte: startOfMonth, lt: startOfNextMonth },
        status: { not: "CANCELLED" },
      },
      orderBy: { startTime: "asc" },
      select: { id: true, title: true, startTime: true, slug: true },
    }),
  ]);

  const todayDay = now.getDate();

  const birthdays: MonthBirthday[] = membersWithDob
    .filter((m) => m.dateOfBirth!.getMonth() === currentMonth)
    .map((m) => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      dateOfBirth: m.dateOfBirth!,
      day: m.dateOfBirth!.getDate(),
      isToday: m.dateOfBirth!.getDate() === todayDay,
    }))
    .sort((a, b) => a.day - b.day);

  return { birthdays, events: events as MonthEvent[] };
}
