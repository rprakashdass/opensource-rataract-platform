import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: "ANNOUNCEMENT" | "EVENT" | "FINANCE" | "MINUTE";
  href: string;
};

export async function getRecentNotifications(clubId: string): Promise<NotificationItem[]> {
  // Fetch latest 2 announcements
  const announcements = await prisma.announcement.findMany({
    where: { clubId, publishStatus: "PUBLISHED" },
    orderBy: { publishedAt: 'desc' },
    take: 2,
    select: { id: true, title: true, description: true, publishedAt: true }
  });

  // Fetch latest 2 events added
  const events = await prisma.event.findMany({
    where: { clubId, status: { not: "DRAFT" } },
    orderBy: { createdAt: 'desc' },
    take: 2,
    select: { id: true, title: true, description: true, createdAt: true }
  });

  // Combine and sort
  const items: NotificationItem[] = [
    ...announcements.map(a => ({
      id: `ann-${a.id}`,
      title: a.title,
      description: a.description || undefined,
      date: a.publishedAt || new Date(),
      type: "ANNOUNCEMENT" as const,
      href: `${ROUTES.DASHBOARD}/announcements/${a.id}` // Defaulting to dashboard view
    })),
    ...events.map(e => ({
      id: `evt-${e.id}`,
      title: e.title,
      description: e.description || undefined,
      date: e.createdAt,
      type: "EVENT" as const,
      href: `${ROUTES.DASHBOARD}/events/${e.id}`
    }))
  ];

  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  return items.slice(0, 5);
}
