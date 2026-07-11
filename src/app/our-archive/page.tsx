import { getPublicMilestones } from "@/features/public/queries/getPublicMilestones";
import { PageHero } from "@/components/ui/public/PageHero";
import { PublicSection } from "@/components/ui/public/PublicSection";
import { CmsText } from "@/components/cms/CmsText";
import ArchiveTimeline from "./_components/ArchiveTimeline";

interface ArchiveCopy {
  archiveTitle?: string | null;
  archiveSubtitle?: string | null;
}

export default async function OurArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isPreview = resolvedParams?.preview === "true";

  const data: any = await getPublicMilestones();

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
        <div className="text-center text-slate-500 font-medium">Failed to load archive.</div>
      </div>
    );
  }

  const milestones = data.milestones || [];
  const copy: ArchiveCopy = data.settings || {};

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      <PageHero
        eyebrow="Club History"
        title={<CmsText channel="archive" initial={copy} field="archiveTitle" fallback="Our Journey & Milestones" isPreview={isPreview} />}
        subtitle={<CmsText channel="archive" initial={copy} field="archiveSubtitle" fallback="Explore the chronological archive of campaigns, citations, and flagship projects completed by our delegates over the years." isPreview={isPreview} />}
      />
      <PublicSection background="white">
        <div className="space-y-12 max-w-3xl mx-auto mt-8">
          <ArchiveTimeline milestones={milestones} />
        </div>
      </PublicSection>
    </div>
  );
}
