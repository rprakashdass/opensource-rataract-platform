import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres.rorycroslonygewjlhdz:2026%5Eracnexus@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  max: 1,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const club = await prisma.club.findFirst();
  if (!club) {
    console.log("No club found!");
    process.exit(1);
  }
  console.log("Club ID:", club.id);
  const rawAvailableYears = await prisma.financialYear.findMany({ 
    where: { clubId: club.id }, 
    orderBy: { name: 'desc' } 
  });
  console.log("Years count:", rawAvailableYears.length);
  rawAvailableYears.forEach(y => console.log(`- name="${y.name}" id="${y.id}"`));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
