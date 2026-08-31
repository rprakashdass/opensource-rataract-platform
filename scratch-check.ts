import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function run() {
  const clubs = await prisma.club.findMany({
    include: { websiteSettings: true }
  });
  console.log(JSON.stringify(clubs.map(c => ({
    presSignature: c.websiteSettings?.presSignature,
    treasSignature: c.websiteSettings?.treasSignature,
    presName: c.websiteSettings?.presName
  })), null, 2));
}
run();
