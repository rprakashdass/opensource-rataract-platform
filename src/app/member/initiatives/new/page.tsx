import { getCurrentClub } from "@/lib/club";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import InitiativeForm from "../_components/InitiativeForm";
import { PageHeader } from "@/components/portal";

export default async function NewInitiativePage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const portfolios = await prisma.portfolio.findMany({
    where: { clubId: club.id, isActive: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="New Idea"
        description="Suggest an event or project idea for the club to consider."
        backHref={`${ROUTES.DASHBOARD}/initiatives`}
        backLabel="Back to Ideas"
      />

      <InitiativeForm portfolios={portfolios} />
    </div>
  );
}
