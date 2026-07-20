import { getSession, canManageWebsite } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getCurrentClub } from "@/lib/club";
import { getComplaints } from "@/features/complaints/queries/getComplaints";
import ComplaintsTable from "./_components/ComplaintsTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Anonymous Complaints | Admin",
};

interface PageProps {
  searchParams: Promise<{ status?: string; category?: string; page?: string }>;
}

export default async function ComplaintsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || !canManageWebsite(session)) {
    redirect("/admin/unauthorized");
  }

  const club = await getCurrentClub();
  if (!club) redirect("/admin");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const result = await getComplaints(club.id, {
    status: params.status,
    category: params.category,
    page,
    pageSize: 20,
  });

  const { data: complaints, total } = "error" in result
    ? { data: [], total: 0 }
    : result;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Anonymous Complaints</h1>
        <p className="text-sm text-slate-500 mt-1">
          Member submissions are fully anonymous — no user identity is attached to any entry.
        </p>
      </div>

      <ComplaintsTable
        complaints={complaints}
        total={total}
        page={page}
        pageSize={20}
        currentStatus={params.status}
        currentCategory={params.category}
      />
    </div>
  );
}
