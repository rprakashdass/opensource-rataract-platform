const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.event.findMany({ select: { id: true, title: true, status: true, publishStatus: true, visibility: true }});
  console.log(events);
}
main().catch(console.error).finally(() => prisma.$disconnect());
