import { getPublicMilestones } from "@/features/public/queries/getPublicMilestones";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { RevealBlock, Eyebrow, EmptyState } from "@/components/ui/public/v2";
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
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <EmptyState
          title="The archive shelf is momentarily out of reach."
          detail="We couldn't load our history just now. Please try again shortly."
        />
      </div>
    );
  }

  const milestones = data.milestones || [];
  const copy: ArchiveCopy = data.settings || {};

  return (
    <div className="min-h-screen bg-paper">
      {/* Compact interior hero */}
      <section className="pt-40 md:pt-48 pb-14 md:pb-20 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow className="mb-5">Club history</Eyebrow>
            <h1 className="font-display font-medium text-ink tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
              <CmsText
                channel="archive"
                initial={copy}
                field="archiveTitle"
                fallback="Our journey and milestones"
                isPreview={isPreview}
              />
            </h1>
            <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-xl">
              <CmsText
                channel="archive"
                initial={copy}
                field="archiveSubtitle"
                fallback="Explore the chronological archive of campaigns, citations, and flagship projects completed by our delegates over the years."
                isPreview={isPreview}
              />
            </p>
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      <section className="py-20 md:py-28 bg-wash">
        <MaxWidthWrapper>
          <div className="max-w-4xl">
            <ArchiveTimeline milestones={milestones} />
          </div>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
