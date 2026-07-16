import { getMembers } from "@/features/members/queries/getMembers";
import Link from "next/link";
import { Plus, Users, Activity, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid, TableWrap } from "@/components/portal";
import { MemberListView } from "./_components/MemberListView";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams.status || "ALL";
  const { members, error } = await getMembers(statusFilter);

  if (error) {
    return <div className="p-8 text-rose-600 font-bold">{error}</div>;
  }

  const activeCount = members?.length || 0;
  const boardCount = members?.filter(m => m.boardMemberships?.length > 0).length || 0;
  const totalCount = members?.length || 0;

  const safeMembers = members?.map(m => ({
    ...m,
    boardMemberships: m.boardMemberships?.map((b: any) => ({
      ...b,
      financialYear: b.financialYear ? {
        ...b.financialYear,
        openingBalance: Number(b.financialYear.openingBalance),
        closingBalance: b.financialYear.closingBalance ? Number(b.financialYear.closingBalance) : null
      } : null
    }))
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <PageHeader
        title="Members & Directory"
        description="Manage club members, alumni, and board roles"
        actions={
          <Button asChild className="bg-brand hover:bg-brand-deep text-white gap-2">
            <Link href="/admin/members/new">
              <Plus className="w-4 h-4" /> Add Member
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <StatGrid className="lg:grid-cols-3">
        <StatCard label="Total Members" value={totalCount} icon={Users} tone="brand" />
        <StatCard label="Members" value={activeCount} icon={Activity} tone="positive" />
        <StatCard label="Board Members" value={boardCount} icon={Shield} tone="warning" />
      </StatGrid>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/members">
          <Badge variant="default" className="px-4 py-1.5 cursor-pointer bg-slate-900">
            All Members
          </Badge>
        </Link>
      </div>

      {/* Members List */}
      <TableWrap>
        {members?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <UserCheck className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-base font-semibold text-slate-900 mb-1">No members found</h3>
            <p className="text-sm text-slate-500 mb-4">Start by adding members to your club directory.</p>
            <Link href="/admin/members/new">
              <Button variant="outline">Add First Member</Button>
            </Link>
          </div>
        ) : (
          <MemberListView members={safeMembers || []} />
        )}
      </TableWrap>

    </div>
  );
}
