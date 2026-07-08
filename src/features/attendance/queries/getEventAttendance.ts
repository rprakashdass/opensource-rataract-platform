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
          attendance: true,
          attendanceSessions: {
              where: { active: true },
              take: 1
          }
      }
  });

  if (!event) return { error: "Event not found" };

  return { event };
}
