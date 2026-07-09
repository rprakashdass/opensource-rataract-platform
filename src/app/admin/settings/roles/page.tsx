import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RoleList from "./_components/RoleList";

export default async function RolesPage() {
  const club = await getCurrentClub();
  if (!club) redirect("/setup");

  const roles = await prisma.clubRole.findMany({
    where: { clubId: club.id },
    orderBy: [
      { category: "asc" },
      { displayOrder: "asc" }
    ]
  });

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Board Role Configuration</h1>
            <p className="text-slate-500 mt-1">Define the leadership structure for your club.</p>
          </div>
        </div>
      </div>

      <RoleList initialRoles={roles} />
    </div>
  );
}
