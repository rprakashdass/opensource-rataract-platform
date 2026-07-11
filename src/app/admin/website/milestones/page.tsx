import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/website" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Club Milestones</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Manage the interactive timeline on your About page and the dedicated /our-archive page.</p>
          </div>
        </div>
      </div>

      <ArchiveHeroForm settings={settings} />
      <MilestoneList initialMilestones={milestones} clubId={club.id} />
    </div>
  );
}
