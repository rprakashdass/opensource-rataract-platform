"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

export const getPublicLayoutData = unstable_cache(
  async () => {
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
  },
  ['layout-data'],
  {
    tags: ['layout', 'club', 'website-settings'],
    revalidate: 3600 // Cache for 1 hour by default, rely on tags for invalidation
  }
);
