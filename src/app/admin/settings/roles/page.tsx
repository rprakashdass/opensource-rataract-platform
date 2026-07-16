import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import RoleList from "./_components/RoleList";

export default async function RolesPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const roles = await prisma.clubRole.findMany({
    where: { clubId: club.id },
    orderBy: [
      { category: "asc" },
      { displayOrder: "asc" }
    ]
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 py-8 space-y-6">
      <PageHeader
        title="Board Role Configuration"
        description="Define the leadership structure for your club."
        backHref="/admin/settings"
        backLabel="Settings"
      />

      <RoleList initialRoles={roles} />
    </div>
  );
}
