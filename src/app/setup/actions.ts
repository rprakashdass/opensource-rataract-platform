"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { setSession } from "@/lib/auth/session";

export async function initializeClub(formData: FormData) {
  try {
    const existingClub = await getCurrentClub();
    if (existingClub) {
      return { error: "Platform is already initialized with a club." };
    }

    const clubName = formData.get("clubName") as string;
    const district = formData.get("district") as string;
    const tenureYear = formData.get("tenureYear") as string;
    const logoUrl = formData.get("logoUrl") as string | undefined;

    const adminName = formData.get("adminName") as string;
    const adminEmail = (formData.get("adminEmail") as string).toLowerCase();
    const adminPassword = formData.get("adminPassword") as string;

    if (!clubName || !district || !tenureYear || !adminName || !adminEmail || !adminPassword) {
      return { error: "Missing required fields." };
    }

    // Wrap in transaction if possible, or just sequential
    const club = await prisma.club.create({
      data: {
        name: clubName,
        district,
        tenureYear,
        logoUrl: logoUrl || null,
        country: "India", // Default
      },
    });

    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: adminPassword,
        roles: ["SUPER_ADMIN"],
      },
    });

    // We do NOT create a Member profile automatically per user instructions.

    // Sign in immediately
    await setSession({
      id: user.id,
      email: user.email,
      name: user.name || "",
      roles: user.roles,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to initialize club:", error);
    return { error: error.message || "An error occurred during initialization." };
  }
}
