import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import HomepageEditorForm from "./_components/HomepageEditorForm";
import { prisma } from "@/lib/prisma";

export default async function HomepageEditorPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const [settings, metrics] = await Promise.all([
    getOrCreateWebsiteSettings(club.id),
    prisma.websiteMetric.findMany({
      where: { clubId: club.id },
      orderBy: { displayOrder: "asc" }
    })
  ]);

  return (
    <div className="w-full h-full px-4 md:px-8 py-6 flex flex-col">
      <PageHeader
        title="Homepage Visual Editor"
        description="Real-time side-by-side preview and styling customize."
        backHref="/admin/website"
        backLabel="Website Control Center"
        className="mb-4 shrink-0"
      />

      <div className="flex-1 min-h-0">
        <HomepageEditorForm settings={settings} initialMetrics={metrics} />
      </div>
    </div>
  );
}
