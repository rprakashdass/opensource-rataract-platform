import { prisma } from "@/lib/prisma";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const IST = "Asia/Kolkata";

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
  posterUrl: string | null;
}

/**
 * Birthdays and events falling in the current calendar month, scoped to a club.
 * Postgres/Prisma has no month-only filter for a DateTime column, so birthdays
 * are fetched with `not: null` and filtered/sorted in JS by month and day.
 *
 * "Today"/"this month" are computed in IST, not the server's local time —
 * on a UTC server, plain Date getters shift the calendar day for the
 * 00:00–05:30 IST window (see the events timezone fixes elsewhere in the app).
 */
export async function getThisMonthHighlights(clubId: string) {
  const nowIST = toZonedTime(new Date(), IST);
  const currentMonth = nowIST.getMonth();
  const startOfMonth = fromZonedTime(new Date(nowIST.getFullYear(), currentMonth, 1), IST);
  const startOfNextMonth = fromZonedTime(new Date(nowIST.getFullYear(), currentMonth + 1, 1), IST);

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
      select: {
        id: true,
        title: true,
        startTime: true,
        posterMediaId: true,
        bannerMediaId: true,
        media: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, url: true } },
      },
    }),
  ]);

  const todayDay = nowIST.getDate();

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

  const monthEvents: MonthEvent[] = events.map((e) => {
    const poster = e.media.find((m) => m.id === e.posterMediaId || m.id === e.bannerMediaId) || e.media[0];
    return { id: e.id, title: e.title, startTime: e.startTime, posterUrl: poster?.url || null };
  });

  return { birthdays, events: monthEvents };
}
