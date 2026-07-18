import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";
import { cache } from "react";

const fetchPublicLayoutData = unstable_cache(
  async () => {
    const club = await getCurrentClub();
    if (!club) return null;

    const [websiteSettings, navigationItems] = await Promise.all([
      prisma.websiteSettings.findUnique({
        where: { clubId: club.id },
        select: {
          enableEvents: true,
          enableAnnouncements: true,
          enableJoin: true,
          enablePartner: true,
          enableArchive: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          darkColor: true,
          lightColor: true,
          footerDescription: true,
          footerSocials: true,
          footerQuickLinks: true,
          seoTitle: true,
          seoDescription: true,
        }
      }),
      prisma.navigationItem.findMany({
        where: { clubId: club.id, visible: true },
        orderBy: { displayOrder: "asc" }
      })
    ]);

    return {
      club: {
        id: club.id,
        name: club.name,
        shortName: club.shortName,
        email: club.email,
        phone: club.phone,
        socialMedia: club.socialMedia,
        primaryColor: club.primaryColor,
        missionStatement: club.missionStatement,
        meetingVenue: club.meetingVenue,
        logoUrl: club.logoUrl, // Moved inside cache
      },
      settings: websiteSettings,
      navigationItems: navigationItems.map((item: any) => ({
        id: item.id,
        label: item.label,
        url: item.url,
        external: item.external,
      })),
    };
  },
  ["public-layout-data"],
  { tags: ["settings", "layout"], revalidate: 3600 }
);

// React cache() dedupes the request across components (like generateMetadata and Layout)
export const getPublicLayoutData = cache(async () => {
  try {
    return await fetchPublicLayoutData();
  } catch (error) {
    console.error("Failed to get layout data", error);
    return null;
  }
});
