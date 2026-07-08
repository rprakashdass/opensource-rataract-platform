import { prisma } from "./src/lib/prisma";
import { SystemRole } from "@prisma/client";

async function main() {
  const superadmin = await prisma.user.upsert({
    where: { email: "prakash@nexus" },
    update: {
      password: "prakash@nexus",
      name: "Rotaract Super Admin",
      roles: [SystemRole.SUPER_ADMIN]
    },
    create: {
      email: "prakash@nexus",
      password: "prakash@nexus",
      name: "Rotaract Super Admin",
      avatar: "/user.png",
      roles: [SystemRole.SUPER_ADMIN]
    },
  });
  console.log("seeded");
}
main().catch(console.error).finally(() => prisma.$disconnect());
