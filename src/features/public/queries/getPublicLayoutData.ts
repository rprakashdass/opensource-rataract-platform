import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const getCachedLayoutText = unstable_cache(
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
  ["public-layout-text-data"],
  { tags: ["layout", "website-settings"], revalidate: 3600 }
);

export async function getPublicLayoutData() {
  try {
    const base = await getCachedLayoutText();
    if (!base) return null;

    // Fetch the logoUrl uncached to prevent exceeding Next.js Cache 2MB payload limits
    const logoData = await prisma.club.findUnique({
      where: { id: base.club.id },
      select: { logoUrl: true }
    });

    return {
      club: {
        ...base.club,
        logoUrl: logoData?.logoUrl || null,
      },
      settings: base.settings,
      navigationItems: base.navigationItems,
    };
  } catch (error) {
    console.error("Failed to get layout data", error);
    return null;
  }
}
