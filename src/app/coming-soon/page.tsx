import type { Metadata } from "next";
import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { redirect } from "next/navigation";
import ComingSoonExperience from "./ComingSoonExperience";

// Keep the teaser out of search results while the real site is gated.
export const metadata: Metadata = {
  title: "Coming soon",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function ComingSoonPage() {
  const club = await getCurrentClub().catch(() => null);
  const clubName = club?.name || "Our new website";
  const logoUrl = club?.logoUrl || null;
  const social = (club?.socialMedia as Record<string, string> | null) || null;

  const settings = club ? await getOrCreateWebsiteSettings(club.id).catch(() => null) : null;
  const launchAt = settings?.launchAt ?? null;
  const siteLive = settings?.siteLive ?? false;

  const scheduledPassed = !!launchAt && launchAt.getTime() <= Date.now();
  const isLive = siteLive || scheduledPassed || process.env.SITE_LIVE === "true";

  if (isLive) {
    redirect("/");
  }

  const launchLabel = launchAt
    ? `${MONTHS[launchAt.getMonth()]} ${launchAt.getDate()}, ${launchAt.getFullYear()}`
    : null;

  const socials = (["instagram", "linkedin", "youtube"] as const)
    .filter((k) => !!social?.[k])
    .map((k) => ({ key: k, href: social![k] }));

  return (
    <ComingSoonExperience
      clubName={clubName}
      logoUrl={logoUrl}
      launchAt={launchAt ? launchAt.toISOString() : null}
      launchLabel={launchLabel}
      socials={socials}
    />
  );
}
