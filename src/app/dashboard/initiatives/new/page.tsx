import { getCurrentClub } from "@/lib/club";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import InitiativeForm from "../_components/InitiativeForm";

export default async function NewInitiativePage() {
  const club = await getCurrentClub();
  if (!club) redirect("/setup");

  const portfolios = await prisma.portfolio.findMany({
    where: { clubId: club.id, isActive: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`${ROUTES.DASHBOARD}/initiatives`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Proposal</h1>
          <p className="text-slate-500 mt-1 text-sm">Suggest an event or project idea for the club to consider.</p>
        </div>
      </div>

      <InitiativeForm portfolios={portfolios} />
    </div>
  );
}
