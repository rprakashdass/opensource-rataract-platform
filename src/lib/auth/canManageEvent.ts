import { prisma } from "@/lib/prisma";
import { canManageClub } from "@/lib/auth/session";

/**
 * Resource-based event authorization: admins (canManageClub) can manage any
 * event; a regular member can manage ONLY events where they are CHAIR/CO_CHAIR.
 *
 * NOTE: async + DB-backed (unlike the sync canManageClub) — always `await`.
 * Kept out of session.ts so the edge middleware's import surface stays small.
 */
export async function canManageEvent(session: any, eventId: string): Promise<boolean> {
  if (!session) return false;
  if (canManageClub(session)) return true;

  const memberId = session.member?.id;
  if (!memberId || !eventId) return false;

  const role = await prisma.eventMember.findUnique({
    where: { eventId_memberId: { eventId, memberId } },
    select: { role: true },
  });
  return role?.role === "CHAIR" || role?.role === "CO_CHAIR";
}
