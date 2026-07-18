"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getCachedUpdates = unstable_cache(
  async (projectId: string, page: number, take: number) => {
    const skip = (page - 1) * take;

    const [updates, totalCount] = await Promise.all([
      prisma.projectUpdate.findMany({
        where: {
          projectId,
          isPublished: true
        },
        orderBy: { date: "desc" },
        skip,
        take,
        include: {
          media: { select: { url: true } },
          participants: {
            select: {
              member: { select: { name: true, avatar: true } }
            }
          }
        }
      }),
      prisma.projectUpdate.count({
        where: {
          projectId,
          isPublished: true
        }
      })
    ]);

    // Also get total count of all published updates to calculate "Day N" backwards
    // If there are 30 total updates, the oldest is Day 1, newest is Day 30.
    // So update at index i (where oldest is 0) is Day (i + 1)
    // To give each update its "Day N" label, we need its absolute index.
    // The easiest way is to just know the total count, and since they are ordered desc:
    // Update 1 (newest) = totalCount - skip
    // Update 2 = totalCount - skip - 1...
    
    return {
      updates: updates.map((update, idx) => ({
        ...update,
        dayNumber: totalCount - skip - idx
      })),
      totalCount,
      hasMore: skip + take < totalCount
    };
  },
  ["project-updates-pagination"], // key parts (args are automatically added)
  {
    tags: ["project-updates"],
    revalidate: 300
  }
);

export async function getProjectUpdatesPage(projectId: string, page: number) {
  // Use a constant page size of 12
  const take = 12;
  return getCachedUpdates(projectId, page, take);
}

export async function getProjectUpdatesImpact(projectId: string) {
  const getCachedImpact = unstable_cache(
    async (pid: string) => {
      const updates = await prisma.projectUpdate.findMany({
        where: { projectId: pid, isPublished: true },
        select: { volunteerHours: true, beneficiaries: true }
      });

      return updates.reduce(
        (acc: { volunteerHours: number; beneficiaries: number }, curr) => ({
          volunteerHours: acc.volunteerHours + (curr.volunteerHours ?? 0),
          beneficiaries: acc.beneficiaries + (curr.beneficiaries ?? 0),
        }),
        { volunteerHours: 0, beneficiaries: 0 }
      );
    },
    ["project-updates-impact"],
    { tags: ["project-updates"], revalidate: 300 }
  );

  return getCachedImpact(projectId);
}
