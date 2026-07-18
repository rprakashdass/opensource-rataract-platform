"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getFundableCauses() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const clubId = session.clubId;
    if (!clubId) return { error: "No club associated with user" };

    const [projects, events] = await Promise.all([
      prisma.project.findMany({
        where: { clubId, seekingSponsorship: true },
        select: { id: true, title: true, sponsorshipGoal: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.event.findMany({
        where: { clubId, seekingSponsorship: true },
        select: { id: true, title: true, sponsorshipGoal: true, fundsRaised: true },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const mappedProjects = projects.map(p => ({ ...p, causeType: "PROJECT" as const, fundsRaised: null }));
    const mappedEvents = events.map(e => ({ ...e, causeType: "EVENT" as const }));

    return { success: true, causes: [...mappedProjects, ...mappedEvents].sort((a, b) => b.title.localeCompare(a.title)) };
  } catch (error: any) {
    console.error("Failed to fetch fundable causes:", error);
    return { error: error.message || "Failed to fetch causes" };
  }
}
