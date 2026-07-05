import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const members = await prisma.member.findMany({ include: { user: true } });
  console.log(members.map(m => ({ id: m.id, email: m.email, userEmail: m.user?.email, status: m.status })));
}
main().finally(() => {
  prisma.$disconnect();
  pool.end();
});
