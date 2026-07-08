"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";

export async function getPublicClubDetails() {
  try {
    const club = await getCurrentClub();
    if (!club) return null;

    return {
      name: club.name,
      shortName: club.shortName,
      logoUrl: club.logoUrl,
      email: club.email,
      phone: club.phone,
      socialMedia: club.socialMedia,
      primaryColor: club.primaryColor,
    };
  } catch (error) {
    console.error("Failed to get club details", error);
    return null;
  }
}
