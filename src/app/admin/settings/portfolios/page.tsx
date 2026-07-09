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
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portfolio Management</h1>
            <p className="text-slate-500 mt-1">Manage the avenues of service and domain areas for your club.</p>
          </div>
        </div>
      </div>

      <PortfolioList initialPortfolios={portfolios} />
    </div>
  );
}
