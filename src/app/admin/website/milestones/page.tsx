import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MilestoneList from "./_components/MilestoneList";

export default async function MilestonesEditorPage() {
  const club = await getCurrentClub();
  if (!club) redirect("/setup");

  const milestones = await prisma.milestone.findMany({
    where: { clubId: club.id },
    orderBy: [{ year: "desc" }, { displayOrder: "asc" }]
  });

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/website" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Club Milestones</h1>
            <p className="text-slate-500 mt-1">Manage the interactive timeline on your About page.</p>
          </div>
        </div>
      </div>

      <MilestoneList initialMilestones={milestones} clubId={club.id} />
    </div>
  );
}
