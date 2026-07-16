"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Shield, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { addPortfolioAssignment, deletePortfolioAssignment, addBoardRole, deleteBoardRole } from "@/features/members/actions/memberAssignments";

export default function AssignmentsManager({ 
  memberId, 
  portfolioAssignments, 
  boardMemberships,
  availablePortfolios,
  availableRoles,
  availableYears
}: { 
  memberId: string;
  portfolioAssignments: any[];
  boardMemberships: any[];
  availablePortfolios: any[];
  availableRoles: any[];
  availableYears: any[];
}) {
  const [loading, setLoading] = useState(false);
  
  // Forms
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioData, setPortfolioData] = useState({ portfolioId: "", roleTitle: "", tenureYear: availableYears[0]?.name || "" });

  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleData, setRoleData] = useState({ roleId: "", financialYearId: availableYears[0]?.id || "" });

  const handleAddPortfolio = async () => {
    if (!portfolioData.portfolioId || !portfolioData.roleTitle || !portfolioData.tenureYear) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    const res = await addPortfolioAssignment(memberId, portfolioData);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Assignment added");
      setShowPortfolioForm(false);
    }
  };

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

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    const res = await deletePortfolioAssignment(id, memberId);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else toast.success("Assignment deleted");
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
      
      {/* Portfolio Assignments */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Portfolio Assignments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowPortfolioForm(!showPortfolioForm)}>
            <Plus className="w-4 h-4 mr-2" /> Add Assignment
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {showPortfolioForm && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-end">
              <div className="w-full">
                <label className="text-xs font-bold text-slate-500 uppercase">Portfolio</label>
                <select value={portfolioData.portfolioId} onChange={e => setPortfolioData({...portfolioData, portfolioId: e.target.value})} className="w-full p-2 mt-1 border rounded-lg text-sm">
                  <option value="">Select Portfolio</option>
                  {availablePortfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="w-full">
                <label className="text-xs font-bold text-slate-500 uppercase">Role Title</label>
                <input type="text" value={portfolioData.roleTitle} onChange={e => setPortfolioData({...portfolioData, roleTitle: e.target.value})} placeholder="e.g. Director" className="w-full p-2 mt-1 border rounded-lg text-sm" />
              </div>
              <div className="w-full">
                <label className="text-xs font-bold text-slate-500 uppercase">Year</label>
                <select value={portfolioData.tenureYear} onChange={e => setPortfolioData({...portfolioData, tenureYear: e.target.value})} className="w-full p-2 mt-1 border rounded-lg text-sm">
                  {availableYears.map(y => <option key={y.name} value={y.name}>{y.name}</option>)}
                </select>
              </div>
              <Button onClick={handleAddPortfolio} disabled={loading} className="shrink-0 bg-brand hover:bg-brand-deep text-white">Save</Button>
            </div>
          )}

          {portfolioAssignments?.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No portfolio assignments.</p>
          ) : (
            <div className="space-y-2">
              {portfolioAssignments?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="w-5 h-5 text-rose-500" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">{p.portfolio.name}</p>
                      <p className="text-xs text-slate-500">{p.roleTitle} • {p.tenureYear}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePortfolio(p.id)} disabled={loading} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
              <Button onClick={handleAddRole} disabled={loading} className="shrink-0 bg-amber-600 hover:bg-amber-700">Save</Button>
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
