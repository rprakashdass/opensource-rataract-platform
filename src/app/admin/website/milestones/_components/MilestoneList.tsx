"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Milestone } from "@prisma/client";
import { toast } from "sonner";
import { saveMilestone, deleteMilestone } from "@/features/public/actions/manageMilestones";
import { Plus, Trash2, Edit2, X, Flag } from "lucide-react";

export default function MilestoneList({ initialMilestones, clubId }: { initialMilestones: Milestone[], clubId: string }) {
  const [milestones, setMilestones] = useState(initialMilestones);
  useEffect(() => setMilestones(initialMilestones), [initialMilestones]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({ year: "", title: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleEdit = (m: Milestone) => {
    setEditingId(m.id);
    setFormData({ year: m.year, title: m.title, description: m.description || "" });
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ year: new Date().getFullYear().toString(), title: "", description: "" });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ year: "", title: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.title) return toast.error("Year and Title are required");

    setLoading(true);
    const res = await saveMilestone({
      id: editingId || undefined,
      clubId,
      year: formData.year,
      title: formData.title,
      description: formData.description
    });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingId ? "Milestone updated!" : "Milestone created!");
      
      // Optimistic update
      if (res.data) {
        if (editingId) {
          setMilestones(prev => prev.map(m => m.id === res.data!.id ? res.data! : m));
        } else {
          setMilestones(prev => {
            const arr = [res.data!, ...prev].filter((x): x is Milestone => x !== undefined);
            return arr.sort((a, b) => b.year.localeCompare(a.year));
          });
        }
      }
      
      handleCancel();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    
    setLoading(true);
    const res = await deleteMilestone(id);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Milestone deleted");
      setMilestones(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {!isAdding && !editingId && (
        <div className="flex justify-end">
          <Button onClick={handleAddNew} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Milestone
          </Button>
        </div>
      )}

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900">{editingId ? "Edit Milestone" : "New Milestone"}</h3>
            <button type="button" onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <Input 
                value={formData.year} 
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                placeholder="YYYY" 
                required 
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Club Founded" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this milestone..." 
              rows={3} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="rounded-xl">{loading ? "Saving..." : "Save Milestone"}</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {milestones.length > 0 ? (
          milestones.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-start gap-4 group hover:border-slate-200 hover:shadow-sm transition-all">
              <div className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-lg shrink-0 mt-1">
                {m.year}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-lg">{m.title}</h4>
                {m.description && <p className="text-slate-500 mt-1 text-sm">{m.description}</p>}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="button" variant="ghost" size="sm" onClick={() => handleEdit(m)} className="h-8 w-8 p-0 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="h-8 w-8 p-0 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <Flag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">No milestones yet</h3>
            <p className="text-slate-500 text-sm mt-1">Add key moments in your club's history to build your timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
