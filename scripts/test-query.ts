import { prisma } from "../src/lib/prisma";

async function main() {
  const club = await prisma.club.findFirst();
  if (!club) throw new Error("No club found");
  const now = new Date();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  
  const upcomingEvents = await prisma.event.findMany({
    where: {
      clubId: club.id,
      status: { in: ["UPCOMING", "ONGOING"] },
      publishStatus: "PUBLISHED",
      visibility: "PUBLIC",
      OR: [
        { endTime: { gte: now } },
        { endTime: null, startTime: { gte: fourHoursAgo } }
      ]
    },
    select: { title: true, startTime: true, endTime: true, status: true, publishStatus: true, visibility: true }
  });
  console.log("Found upcoming events:", upcomingEvents);
}

main().catch(console.error);
