import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.event.updateMany({
    where: {
      status: { not: "DRAFT" },
      publishStatus: "DRAFT"
    },
    data: {
      publishStatus: "PUBLISHED",
      publishedAt: new Date()
    }
  })
  console.log(`Updated ${updated.count} events to PUBLISHED`)
  
  // also let's just make all events PUBLIC and PUBLISHED for testing
  const allUpdated = await prisma.event.updateMany({
    where: { publishStatus: "DRAFT" },
    data: { publishStatus: "PUBLISHED", status: "UPCOMING", publishedAt: new Date() }
  })
  console.log(`Force updated ${allUpdated.count} draft events to PUBLISHED`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
