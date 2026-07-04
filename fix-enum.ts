import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Altering Role Enum in PostgreSQL...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE 'FINANCE_ADMIN';`);
    console.log("Added FINANCE_ADMIN");
  } catch (e: any) {
    console.log("FINANCE_ADMIN might already exist or error:", e.message);
  }
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE 'FINANCE_VIEWER';`);
    console.log("Added FINANCE_VIEWER");
  } catch (e: any) {
    console.log("FINANCE_VIEWER might already exist or error:", e.message);
  }
  
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
