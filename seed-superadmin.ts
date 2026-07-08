import { prisma } from "./src/lib/prisma";
import { SystemRole } from "@prisma/client";

async function main() {
  console.log("Applying User.role column migration...");

  const superAdminEmail = process.env.SUPERADMIN_LOGIN_ID;
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error(
      "Missing SUPERADMIN_LOGIN_ID or SUPERADMIN_PASSWORD in environment"
    );
  }

  const superadmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      password: superAdminPassword,
      name: "Rotaract Super Admin",
      roles: [SystemRole.SUPER_ADMIN]
    },
    create: {
      email: superAdminEmail,
      password: superAdminPassword,
      name: "Rotaract Super Admin",
      avatar: "/user.png",
      roles: [SystemRole.SUPER_ADMIN]
    },
  });

  console.log("\n✓ Superadmin account is ready!");
  console.log(`  Login ID : ${superadmin.email}`);
  console.log(`  Password : ${superAdminPassword}`);
  console.log("  Roles    : [ADMIN]");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
