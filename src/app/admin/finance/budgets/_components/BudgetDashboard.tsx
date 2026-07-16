"use client";

import { useState } from "react";
import { Plus, Trash2, Link as LinkIcon, PieChart, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/portal";
import { toast } from "sonner";
import { createBudget, deleteBudget } from "@/features/finance/actions/manageBudget";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BudgetDashboardProps {
  data: {
    activeFinancialYear: any;
    budgets: any[];
    transactions: any[];
    projects: any[];
    events: any[];
  }
}

export default function BudgetDashboard({ data }: BudgetDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    sourceType: "PROJECT",
    projectId: "",
    eventId: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createBudget({
        amount: parseFloat(formData.amount),
        projectId: formData.sourceType === "PROJECT" ? formData.projectId : undefined,
        eventId: formData.sourceType === "EVENT" ? formData.eventId : undefined,
        financialYearId: data.activeFinancialYear.id,
      });

      if (res.error) throw new Error(res.error);
      toast.success("Budget created successfully");
      setShowCreate(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    setLoading(true);
    try {
      const res = await deleteBudget(id);
      if (res.error) throw new Error(res.error);
      toast.success("Budget deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete budget");
    } finally {
      setLoading(false);
    }
  };

  if (!data.activeFinancialYear) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Financial Year</h2>
        <p className="text-slate-500 max-w-md mx-auto">Please create an active financial year in the settings before managing budgets.</p>
      </div>
    );
  }

  // Calculate totals
  const totalAllocated = data.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0);
  const totalSpent = data.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const remaining = totalAllocated - totalSpent;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Overview Cards */}
      <StatGrid className="lg:grid-cols-3">
        <StatCard
          label="Total Allocated"
          value={`₹${totalAllocated.toLocaleString()}`}
          tone="brand"
          hint={data.activeFinancialYear.name}
        />
        <StatCard
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString()}`}
          tone="critical"
          hint="Across all approved transactions"
        />
        <StatCard
          label="Remaining"
          value={`₹${remaining.toLocaleString()}`}
          tone="positive"
          hint="Available across all budgets"
        />
      </StatGrid>

      {/* Header and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Project & Event Budgets</h2>
          <p className="text-sm text-slate-500">Track spending limits for ongoing activities</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-brand hover:bg-brand-deep text-white gap-2">
          {showCreate ? "Cancel" : <><Plus className="w-4 h-4" /> New Budget</>}
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-pink-100 bg-pink-50/30">
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Allocate Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm h-10 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="e.g. 5000"
                />
              </div>
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Link To</label>
                <select
                  value={formData.sourceType}
                  onChange={e => setFormData({...formData, sourceType: e.target.value, projectId: "", eventId: ""})}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm h-10 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="PROJECT">Project</option>
                  <option value="EVENT">Event</option>
                </select>
              </div>
              
              {formData.sourceType === "PROJECT" ? (
                <div className="flex-[2] w-full space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Project</label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm h-10 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Choose Project...</option>
                    {data.projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex-[2] w-full space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Event</label>
                  <select
                    required
                    value={formData.eventId}
                    onChange={e => setFormData({...formData, eventId: e.target.value})}
                    className="w-full border border-slate-300 p-2 rounded-lg text-sm h-10 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Choose Event...</option>
                    {data.events.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-8">
                Save
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.budgets.map(budget => {
          // Calculate spent for THIS budget
          const spent = data.transactions
            .filter(t => (budget.projectId && t.projectId === budget.projectId) || (budget.eventId && t.eventId === budget.eventId))
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const allocated = Number(budget.allocatedAmount);
          const remain = allocated - spent;
          const percent = Math.min(Math.round((spent / allocated) * 100) || 0, 100);
          const isOver = spent > allocated;

          return (
            <Card key={budget.id} className={`border-l-4 shadow-sm hover:shadow-md transition-all ${isOver ? 'border-l-rose-500' : 'border-l-brand'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {budget.projectId ? "PROJECT" : "EVENT"}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mt-1 truncate pr-4" title={budget.project?.title || budget.event?.title}>
                      {budget.project?.title || budget.event?.title}
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 -mr-2 -mt-2" onClick={() => handleDelete(budget.id)} disabled={loading}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500 font-medium">Spent: <span className="text-slate-900 font-bold">₹{spent.toLocaleString()}</span></span>
                      <span className="text-slate-500 font-medium">Allocated: ₹{allocated.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-400' : 'bg-brand'}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Remaining</p>
                      <p className={`font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isOver ? `Over by ₹${Math.abs(remain).toLocaleString()}` : `₹${remain.toLocaleString()}`}
                      </p>
                    </div>
                    <Link href={`/admin/finance/transactions?${budget.projectId ? `projectId=${budget.projectId}` : `eventId=${budget.eventId}`}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8 gap-1 border-slate-200">
                        Transactions <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {data.budgets.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <PieChart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No budgets created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
