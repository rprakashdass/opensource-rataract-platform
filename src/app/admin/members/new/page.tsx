import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import NewMemberForm from "./_components/NewMemberForm";

export default async function NewMemberPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const roles = await prisma.clubRole.findMany({
    where: { clubId: club.id },
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
    select: { id: true, name: true, category: true, displayOrder: true },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      <PageHeader
        title="Add New Member"
        description="Create a member profile. A user account will automatically be created for them to access the portal."
        backHref="/admin/members"
        backLabel="Back to Directory"
      />

      <NewMemberForm roles={roles} />
    </div>
  );
}
