import dotenv from "dotenv";
dotenv.config();

import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    console.log("Wiping transactions...");
    await prisma.$executeRawUnsafe(`DELETE FROM "Transfer"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Transaction"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Budget"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "FinancialYear"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Account"`);
    console.log("Successfully wiped database tables!");
  } catch (e) {
    console.error("Failed to wipe database tables:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
