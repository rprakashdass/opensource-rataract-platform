import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Applying User.role column migration...");

  const superAdminEmail = process.env.SUPERADMIN_LOGIN_ID;
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error(
      "Missing SUPERADMIN_LOGIN_ID or SUPERADMIN_PASSWORD in environment"
    );
  }

  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'MEMBER'`
    );
    console.log("✓ Added role column to User table");
  } catch (e: any) {
    console.log("Column may already exist:", e.message);
  }

  // Upsert the superadmin user from environment credentials

  const superadmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      password: superAdminPassword,
      name: "Rotaract Super Admin",
      role: "ADMIN"
    },
    create: {
      email: superAdminEmail,
      password: superAdminPassword,
      name: "Rotaract Super Admin",
      avatar: "/user.png",
      role: "ADMIN"
    },
  });

  console.log("\n✓ Superadmin account is ready!");
  console.log(`  Login ID : ${superadmin.email}`);
  console.log(`  Password : ${superAdminPassword}`);
  console.log("  Role     : ADMIN");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
