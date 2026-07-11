import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import PortfolioList from "./_components/PortfolioList";

export default async function PortfoliosPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const portfolios = await prisma.portfolio.findMany({
    where: { clubId: club.id },
    orderBy: { displayOrder: "asc" }
  });

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Management</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Manage the avenues of service and domain areas for your club.</p>
          </div>
        </div>
      </div>

      <PortfolioList initialPortfolios={portfolios} />
    </div>
  );
}
