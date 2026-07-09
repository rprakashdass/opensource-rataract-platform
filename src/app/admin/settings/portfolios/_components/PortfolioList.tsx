"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Trash2, Edit2, CheckCircle2, Globe, HeartHandshake, Share2, BookOpen, UserPlus, Users, Briefcase, Mic2, Radio, Wrench, Computer } from "lucide-react";

// Standard preset icons to choose from
const ICON_OPTIONS = [
  { name: "HeartHandshake", icon: HeartHandshake },
  { name: "Globe", icon: Globe },
  { name: "Share2", icon: Share2 },
  { name: "BookOpen", icon: BookOpen },
  { name: "UserPlus", icon: UserPlus },
  { name: "Users", icon: Users },
  { name: "Briefcase", icon: Briefcase },
  { name: "Mic2", icon: Mic2 },
  { name: "Radio", icon: Radio },
  { name: "Wrench", icon: Wrench },
  { name: "Computer", icon: Computer },
  { name: "Globe2", icon: Globe },
];

export default function PortfolioList({ initialPortfolios }: { initialPortfolios: any[] }) {
  const [portfolios, setPortfolios] = useState(initialPortfolios);
  useEffect(() => setPortfolios(initialPortfolios), [initialPortfolios]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddNew = () => {
    const newId = "new-" + Date.now();
    const newPortfolio = {
      id: newId,
      name: "",
      description: "",
      icon: "HeartHandshake",
      activities: [],
      displayOrder: portfolios.length,
      isActive: true,
      isNew: true
    };
    setPortfolios([...portfolios, newPortfolio]);
    setIsEditing(newId);
    setEditForm(newPortfolio);
  };

  const handleSave = async (id: string) => {
    setIsLoading(true);
    try {
      const isNew = id.startsWith("new-");
      const url = "/api/admin/portfolios";
      const method = isNew ? "POST" : "PUT";
      
      const payload = {
        ...editForm,
        id: isNew ? undefined : id
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save portfolio");
      
      const saved = await res.json();
      
      setPortfolios(portfolios.map(p => p.id === id ? saved : p));
      setIsEditing(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error saving portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("new-")) {
      setPortfolios(portfolios.filter(p => p.id !== id));
      setIsEditing(null);
      return;
    }

    if (!confirm("Are you sure you want to delete this portfolio?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/portfolios?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setPortfolios(portfolios.filter(p => p.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newPortfolios = [...portfolios];
    // Swap
    const temp = newPortfolios[index].displayOrder;
    newPortfolios[index].displayOrder = newPortfolios[index - 1].displayOrder;
    newPortfolios[index - 1].displayOrder = temp;
    
    // Swap in array for instant UI update
    [newPortfolios[index - 1], newPortfolios[index]] = [newPortfolios[index], newPortfolios[index - 1]];
    setPortfolios(newPortfolios);
    
    // Persist
    await fetch("/api/admin/portfolios", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newPortfolios[index].id, displayOrder: newPortfolios[index].displayOrder }) });
    await fetch("/api/admin/portfolios", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newPortfolios[index - 1].id, displayOrder: newPortfolios[index - 1].displayOrder }) });
    router.refresh();
  };

  const moveDown = async (index: number) => {
    if (index === portfolios.length - 1) return;
    const newPortfolios = [...portfolios];
    // Swap
    const temp = newPortfolios[index].displayOrder;
    newPortfolios[index].displayOrder = newPortfolios[index + 1].displayOrder;
    newPortfolios[index + 1].displayOrder = temp;
    
    // Swap in array
    [newPortfolios[index + 1], newPortfolios[index]] = [newPortfolios[index], newPortfolios[index + 1]];
    setPortfolios(newPortfolios);
    
    // Persist
    await fetch("/api/admin/portfolios", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newPortfolios[index].id, displayOrder: newPortfolios[index].displayOrder }) });
    await fetch("/api/admin/portfolios", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newPortfolios[index + 1].id, displayOrder: newPortfolios[index + 1].displayOrder }) });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500 font-medium">Configure the avenues and domains your club operates in.</p>
        <Button onClick={handleAddNew} disabled={isEditing !== null} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" /> Add Portfolio
        </Button>
      </div>

      <div className="space-y-4">
        {portfolios.map((portfolio, index) => (
          <div key={portfolio.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md flex gap-4">
            
            {/* Drag Handle & Ordering */}
            <div className="flex flex-col items-center justify-center gap-1 text-slate-300">
              <button onClick={() => moveUp(index)} disabled={index === 0 || isEditing !== null} className="hover:text-slate-600 disabled:opacity-30">▲</button>
              <GripVertical className="w-5 h-5 cursor-move opacity-50" />
              <button onClick={() => moveDown(index)} disabled={index === portfolios.length - 1 || isEditing !== null} className="hover:text-slate-600 disabled:opacity-30">▼</button>
            </div>

            {/* Content Area */}
            <div className="flex-1 space-y-4">
              {isEditing === portfolio.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Portfolio Name</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border rounded-lg" 
                        placeholder="e.g. Community Service"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Icon</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {ICON_OPTIONS.map(opt => {
                          const IconComp = opt.icon;
                          const isSelected = editForm.icon === opt.name;
                          return (
                            <button 
                              key={opt.name}
                              onClick={() => setEditForm({...editForm, icon: opt.name})}
                              className={`p-2 rounded-lg border ${isSelected ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                              title={opt.name}
                            >
                              <IconComp className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                    <textarea 
                      value={editForm.description || ""} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border rounded-lg min-h-[80px]" 
                      placeholder="Describe what this portfolio does..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Key Activities (comma separated)</label>
                    <input 
                      type="text" 
                      value={editForm.activities?.join(", ") || ""} 
                      onChange={e => setEditForm({...editForm, activities: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean)})}
                      className="w-full mt-1 px-3 py-2 border rounded-lg" 
                      placeholder="Blood donation camps, Tree plantation..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => {
                      if (portfolio.isNew) setPortfolios(portfolios.filter(p => p.id !== portfolio.id));
                      setIsEditing(null);
                    }}>Cancel</Button>
                    <Button onClick={() => handleSave(portfolio.id)} disabled={isLoading} className="bg-purple-600">Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      {(() => {
                        const iconOpt = ICON_OPTIONS.find(i => i.name === portfolio.icon);
                        const IconComp = iconOpt ? iconOpt.icon : Globe;
                        return <IconComp className="w-6 h-6" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{portfolio.name}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{portfolio.description || "No description provided."}</p>
                      {portfolio.activities?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {portfolio.activities.slice(0, 3).map((act: string, i: number) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{act}</span>
                          ))}
                          {portfolio.activities.length > 3 && <span className="text-xs text-slate-400">+{portfolio.activities.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="icon" onClick={() => { setIsEditing(portfolio.id); setEditForm(portfolio); }} disabled={isEditing !== null}>
                      <Edit2 className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(portfolio.id)} disabled={isEditing !== null} className="hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {portfolios.length === 0 && !isEditing && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No portfolios yet</h3>
            <p className="text-slate-500 mt-1 mb-4">Start by adding your club's avenues of service.</p>
            <Button onClick={handleAddNew} variant="outline" className="bg-white">Add First Portfolio</Button>
          </div>
        )}
      </div>
    </div>
  );
}
