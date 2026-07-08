import { prisma } from "./src/lib/prisma";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "prakash@nexus" } });
  if (!user) { console.log("User not found"); return; }
  
  let club = await prisma.club.findFirst();
  if (!club) {
    club = await prisma.club.create({
      data: { name: "Rotaract Club of NEXUS", district: "3201" }
    });
  }

  await prisma.member.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      clubId: club.id,
      name: "Super Admin",
      phone: "+91 9876543210",
      bloodGroup: "O+",
    }
  });
  console.log("Member attached");
}
main().catch(console.error).finally(() => prisma.$disconnect());
