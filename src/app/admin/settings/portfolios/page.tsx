import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
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
      <PageHeader
        title="Portfolio Management"
        description="Manage the avenues of service and domain areas for your club."
        backHref="/admin/settings"
        backLabel="Settings"
        className="mb-4"
      />

      <PortfolioList initialPortfolios={portfolios} />
    </div>
  );
}
