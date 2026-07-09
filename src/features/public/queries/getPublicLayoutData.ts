"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";

// Not wrapped in unstable_cache: club.logoUrl is stored as a base64 data URL and can
// exceed the Next.js Data Cache's 2MB-per-entry limit, which throws an unhandled
// rejection and breaks the request entirely. Caching isn't worth that failure mode here.
export async function getPublicLayoutData() {
  try {
    const club = await getCurrentClub();
    if (!club) return null;

    const websiteSettings = await prisma.websiteSettings.findUnique({
      where: { clubId: club.id },
      select: {
        enableHero: true,
        enableEvents: true,
        enableGallery: true,
        enableAnnouncements: true,
      }
    });

    return {
      club: {
        name: club.name,
        shortName: club.shortName,
        logoUrl: club.logoUrl,
        email: club.email,
        phone: club.phone,
        socialMedia: club.socialMedia,
        primaryColor: club.primaryColor,
        missionStatement: club.missionStatement,
        meetingVenue: club.meetingVenue,
      },
      settings: websiteSettings,
    };
  } catch (error) {
    console.error("Failed to get layout data", error);
    return null;
  }
}
