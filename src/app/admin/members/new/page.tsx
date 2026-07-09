import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
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
      <Link href="/admin/members" className="text-purple-600 hover:underline text-sm font-semibold flex items-center gap-1 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <UserPlus className="w-8 h-8 text-purple-600" />
          Add New Member
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Create a member profile. A user account will automatically be created for them to access the portal.
        </p>
      </div>

      <NewMemberForm roles={roles} />
    </div>
  );
}
