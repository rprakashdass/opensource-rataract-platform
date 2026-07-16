"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Trash2, Edit2, Shield, UserCheck } from "lucide-react";

const CATEGORIES = [
  { id: "BOARD", label: "Board of Directors", icon: Shield, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", activeTab: "bg-amber-600" },
  { id: "MEMBER", label: "General Members", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", activeTab: "bg-emerald-600" },
];

export default function RoleList({ initialRoles }: { initialRoles: any[] }) {
  const [roles, setRoles] = useState(initialRoles);
  useEffect(() => setRoles(initialRoles), [initialRoles]);
  const [activeTab, setActiveTab] = useState("BOARD");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddNew = (category: string) => {
    const newId = "new-" + Date.now();
    const categoryRoles = roles.filter(r => r.category === category);
    const newRole = {
      id: newId,
      name: "",
      category,
      maxMembers: null,
      displayOrder: categoryRoles.length,
      isNew: true
    };
    setRoles([...roles, newRole]);
    setIsEditing(newId);
    setEditForm(newRole);
  };

  const handleSave = async (id: string) => {
    setIsLoading(true);
    try {
      const isNew = id.startsWith("new-");
      const url = "/api/admin/club-roles";
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

      if (!res.ok) throw new Error("Failed to save role");
      
      const saved = await res.json();
      
      setRoles(roles.map(r => r.id === id ? saved : r));
      setIsEditing(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error saving role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("new-")) {
      setRoles(roles.filter(r => r.id !== id));
      setIsEditing(null);
      return;
    }

    if (!confirm("Are you sure you want to delete this role? Existing assignments might be affected.")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/club-roles?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setRoles(roles.filter(r => r.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting role");
    } finally {
      setIsLoading(false);
    }
  };

  const moveUp = async (role: any, index: number, categoryRoles: any[]) => {
    if (index === 0) return;
    const newRoles = [...roles];
    const role1 = categoryRoles[index];
    const role2 = categoryRoles[index - 1];
    
    const r1Index = newRoles.findIndex(r => r.id === role1.id);
    const r2Index = newRoles.findIndex(r => r.id === role2.id);

    const temp = newRoles[r1Index].displayOrder;
    newRoles[r1Index].displayOrder = newRoles[r2Index].displayOrder;
    newRoles[r2Index].displayOrder = temp;
    
    setRoles(newRoles);
    
    await fetch("/api/admin/club-roles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newRoles[r1Index].id, displayOrder: newRoles[r1Index].displayOrder }) });
    await fetch("/api/admin/club-roles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newRoles[r2Index].id, displayOrder: newRoles[r2Index].displayOrder }) });
    router.refresh();
  };

  const moveDown = async (role: any, index: number, categoryRoles: any[]) => {
    if (index === categoryRoles.length - 1) return;
    const newRoles = [...roles];
    const role1 = categoryRoles[index];
    const role2 = categoryRoles[index + 1];
    
    const r1Index = newRoles.findIndex(r => r.id === role1.id);
    const r2Index = newRoles.findIndex(r => r.id === role2.id);

    const temp = newRoles[r1Index].displayOrder;
    newRoles[r1Index].displayOrder = newRoles[r2Index].displayOrder;
    newRoles[r2Index].displayOrder = temp;
    
    setRoles(newRoles);
    
    await fetch("/api/admin/club-roles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newRoles[r1Index].id, displayOrder: newRoles[r1Index].displayOrder }) });
    await fetch("/api/admin/club-roles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newRoles[r2Index].id, displayOrder: newRoles[r2Index].displayOrder }) });
    router.refresh();
  };

  const category = CATEGORIES.find(c => c.id === activeTab)!;
  const Icon = category.icon;
  const categoryRoles = roles.filter(r => r.category === activeTab).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
        {CATEGORIES.map(cat => {
          const CatIcon = cat.icon;
          const count = roles.filter(r => r.category === cat.id).length;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setIsEditing(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <CatIcon className={`w-4 h-4 ${isActive ? cat.color : ""}`} />
              {cat.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? `${cat.bg} ${cat.color}` : "bg-slate-200 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Header + Add Button */}
      <div className={`flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl border shadow-sm ${category.border}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${category.bg} ${category.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">{category.label}</h2>
        </div>
        <Button
          onClick={() => handleAddNew(activeTab)}
          disabled={isEditing !== null}
          className="bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === "BOARD" ? "Board Role" : "Role"}
        </Button>
      </div>

      {/* Role Cards */}
      <div className="space-y-3">
        {categoryRoles.map((role, index) => (
          <div
            key={role.id}
            className={`bg-white border rounded-xl p-4 shadow-sm transition-all hover:shadow-md flex gap-4 ${
              isEditing === role.id ? "border-brand/40 ring-4 ring-brand/5" : "border-slate-200"
            }`}
          >
            {/* Ordering */}
            <div className="flex flex-col items-center justify-center gap-1 text-slate-300">
              <button onClick={() => moveUp(role, index, categoryRoles)} disabled={index === 0 || isEditing !== null} className="hover:text-slate-600 disabled:opacity-30">▲</button>
              <GripVertical className="w-4 h-4 cursor-move opacity-50" />
              <button onClick={() => moveDown(role, index, categoryRoles)} disabled={index === categoryRoles.length - 1 || isEditing !== null} className="hover:text-slate-600 disabled:opacity-30">▼</button>
            </div>

            {/* Content */}
            <div className="flex-1">
              {isEditing === role.id ? (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Role Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand outline-none"
                        placeholder="e.g. President, Secretary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <Button variant="outline" onClick={() => {
                      if (role.isNew) setRoles(roles.filter(r => r.id !== role.id));
                      setIsEditing(null);
                    }}>Cancel</Button>
                    <Button onClick={() => handleSave(role.id)} disabled={isLoading || !editForm.name} className="bg-brand hover:bg-brand-deep text-white">
                      Save Role
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 h-full">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{role.name}</h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => { setIsEditing(role.id); setEditForm(role); }} disabled={isEditing !== null}>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(role.id)} disabled={isEditing !== null} className="hover:text-rose-600 hover:bg-rose-50 text-slate-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {categoryRoles.length === 0 && !isEditing && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <Icon className={`w-8 h-8 mx-auto mb-3 ${category.color} opacity-40`} />
            <p className="text-sm text-slate-500">No roles configured for {category.label.toLowerCase()} yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
