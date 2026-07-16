"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { addBoardRole, deleteBoardRole } from "@/features/members/actions/memberAssignments";

export default function AssignmentsManager({ 
  memberId, 
  boardMemberships,
  availableRoles,
  availableYears
}: { 
  memberId: string;
  boardMemberships: any[];
  availableRoles: any[];
  availableYears: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleData, setRoleData] = useState({ roleId: "", financialYearId: availableYears[0]?.id || "" });

  const handleAddRole = async () => {
    if (!roleData.roleId || !roleData.financialYearId) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    const res = await addBoardRole(memberId, roleData);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Role added");
      setShowRoleForm(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    const res = await deleteBoardRole(id, memberId);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else toast.success("Role deleted");
  };

  return (
    <div className="space-y-6">
      {/* Board Roles */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Board & Core Roles</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowRoleForm(!showRoleForm)}>
            <Plus className="w-4 h-4 mr-2" /> Assign Role
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {showRoleForm && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col md:flex-row gap-3 items-end">
              <div className="w-full">
                <label className="text-xs font-bold text-amber-700 uppercase">Role</label>
                <select value={roleData.roleId} onChange={e => setRoleData({...roleData, roleId: e.target.value})} className="w-full p-2 mt-1 border rounded-lg text-sm bg-white">
                  <option value="">Select Role</option>
                  {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name} ({r.category})</option>)}
                </select>
              </div>
              <div className="w-full">
                <label className="text-xs font-bold text-amber-700 uppercase">Year</label>
                <select value={roleData.financialYearId} onChange={e => setRoleData({...roleData, financialYearId: e.target.value})} className="w-full p-2 mt-1 border rounded-lg text-sm bg-white">
                  {availableYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>
              <Button onClick={handleAddRole} disabled={loading} className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white">Save</Button>
            </div>
          )}

          {boardMemberships?.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No roles assigned.</p>
          ) : (
            <div className="space-y-2">
              {boardMemberships?.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${b.leftAt ? 'text-slate-400' : 'text-amber-500'}`} />
                    <div>
                      <p className={`font-bold text-sm ${b.leftAt ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {b.role ? b.role.name : b.position}
                      </p>
                      <p className="text-xs text-slate-500">{b.financialYear?.name}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(b.id)} disabled={loading} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
