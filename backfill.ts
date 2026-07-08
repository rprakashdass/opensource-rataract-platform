import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Backfilling events...");
  const res1 = await prisma.event.updateMany({
    where: {
      status: { not: "CANCELLED" }
    },
    data: {
      publishStatus: "PUBLISHED",
      publishedAt: new Date()
    }
  });
  console.log(`Updated ${res1.count} events to PUBLISHED.`);

  console.log("Backfilling projects...");
  const res2 = await prisma.project.updateMany({
    where: {
      status: { not: "CANCELLED" }
    },
    data: {
      publishStatus: "PUBLISHED",
      publishedAt: new Date()
    }
  });
  console.log(`Updated ${res2.count} projects to PUBLISHED.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
