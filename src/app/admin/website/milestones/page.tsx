import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import MilestoneList from "./_components/MilestoneList";
import ArchiveHeroForm from "./_components/ArchiveHeroForm";

export default async function MilestonesEditorPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const [milestones, settings] = await Promise.all([
    prisma.milestone.findMany({
      where: { clubId: club.id },
      orderBy: [{ year: "desc" }, { displayOrder: "asc" }]
    }),
    getOrCreateWebsiteSettings(club.id),
  ]);

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-6">
      <PageHeader
        title="Club Milestones"
        description="Manage the interactive timeline on your About page and the dedicated /our-archive page."
        backHref="/admin/website"
        backLabel="Website Control Center"
        className="mb-4"
      />

      <ArchiveHeroForm settings={settings} />
      <MilestoneList initialMilestones={milestones} clubId={club.id} />
    </div>
  );
}
