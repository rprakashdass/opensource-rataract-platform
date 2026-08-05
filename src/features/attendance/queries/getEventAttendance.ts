import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getEventAttendance(eventId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
          registrations: {
              include: {
                  member: true
              }
          },
          // include member so attendees who never registered still resolve
          attendance: { include: { member: true } },
          attendanceSessions: {
              where: { active: true },
              take: 1
          }
      }
  });

  if (!event) return { error: "Event not found" };

  // All club members — so an admin/chair can add someone who attended but
  // never registered (walk-ins, council guests recorded as members, etc.).
  const members = await prisma.member.findMany({
      where: { clubId: event.clubId },
      select: { id: true, name: true, email: true, avatar: true },
      orderBy: { name: "asc" },
  });

  return { event, members };
}
