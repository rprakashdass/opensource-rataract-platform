import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import LaunchControlForm from "./_components/LaunchControlForm";

export const dynamic = "force-dynamic";

export default async function LaunchControlPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const settings = await getOrCreateWebsiteSettings(club.id);

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-6">
      <PageHeader
        title="Launch Control"
        description="Decide when the public website goes live. Until then, everyone sees the coming-soon teaser."
        backHref="/admin/website"
        backLabel="Website Control Center"
        className="mb-2"
      />

      <LaunchControlForm
        siteLive={settings.siteLive}
        launchAt={settings.launchAt ? settings.launchAt.toISOString() : null}
      />
    </div>
  );
}
