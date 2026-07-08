import { getMembers } from "@/features/members/queries/getMembers";
import Link from "next/link";
import { Plus, Users, Search, Activity, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Members & Directory</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage club members, alumni, and board roles</p>
        </div>
        <Link href="/admin/members/new">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider mb-1">Total Members</p>
                <h3 className="text-3xl font-black">{totalCount}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Members</p>
                <h3 className="text-3xl font-black text-emerald-600">{activeCount}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Leaders</p>
                <h3 className="text-3xl font-black text-amber-600">{boardCount}</h3>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Link href="/admin/members">
            <Badge variant="default" className="px-4 py-1.5 cursor-pointer bg-slate-900">
              All Members
            </Badge>
          </Link>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search members..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {members?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <UserCheck className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No members found</h3>
            <p className="text-sm text-slate-500 mb-4">Start by adding members to your club directory.</p>
            <Link href="/admin/members/new">
              <Button variant="outline">Add First Member</Button>
            </Link>
          </div>
        ) : (
          <MemberListView members={members || []} />
        )}
      </div>

    </div>
  );
}
