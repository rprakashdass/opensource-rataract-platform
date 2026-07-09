"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Trash2, Edit2, Shield, Users, UserCheck } from "lucide-react";

const CATEGORIES = [
  { id: "BOARD", label: "Board of Directors", icon: Shield, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "CORE_TEAM", label: "Core Team", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "MEMBER", label: "General Members", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
];

export default function RoleList({ initialRoles }: { initialRoles: any[] }) {
  const [roles, setRoles] = useState(initialRoles);
  useEffect(() => setRoles(initialRoles), [initialRoles]);
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

    // Swap display order
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

    // Swap
    const temp = newRoles[r1Index].displayOrder;
    newRoles[r1Index].displayOrder = newRoles[r2Index].displayOrder;
    newRoles[r2Index].displayOrder = temp;
    
    setRoles(newRoles);
    
    await fetch("/api/admin/club-roles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newRoles[r1Index].id, displayOrder: newRoles[r1Index].displayOrder }) });
    await fetch("/api/admin/club-roles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newRoles[r2Index].id, displayOrder: newRoles[r2Index].displayOrder }) });
    router.refresh();
  };

  return (
    <div className="space-y-12">
      {CATEGORIES.map(category => {
        const categoryRoles = roles.filter(r => r.category === category.id).sort((a, b) => a.displayOrder - b.displayOrder);
        const Icon = category.icon;

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.bg} ${category.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{category.label}</h2>
              </div>
              <Button onClick={() => handleAddNew(category.id)} disabled={isEditing !== null} className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Add {category.id === "BOARD" ? "Board Role" : "Role"}
              </Button>
            </div>

            <div className="space-y-3">
              {categoryRoles.map((role, index) => (
                <div key={role.id} className={`bg-white border rounded-xl p-4 shadow-sm transition-all hover:shadow-md flex gap-4 ${isEditing === role.id ? 'border-purple-300 ring-4 ring-purple-50' : 'border-slate-200'}`}>
                  
                  {/* Drag Handle & Ordering */}
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-300">
                    <button onClick={() => moveUp(role, index, categoryRoles)} disabled={index === 0 || isEditing !== null} className="hover:text-slate-600 disabled:opacity-30">▲</button>
                    <GripVertical className="w-4 h-4 cursor-move opacity-50" />
                    <button onClick={() => moveDown(role, index, categoryRoles)} disabled={index === categoryRoles.length - 1 || isEditing !== null} className="hover:text-slate-600 disabled:opacity-30">▼</button>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1">
                    {isEditing === role.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Role Name</label>
                            <input 
                              type="text" 
                              value={editForm.name} 
                              onChange={e => setEditForm({...editForm, name: e.target.value})}
                              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
                              placeholder="e.g. President, Secretary"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Max Members (Optional)</label>
                            <input 
                              type="number" 
                              value={editForm.maxMembers || ""} 
                              onChange={e => setEditForm({...editForm, maxMembers: e.target.value})}
                              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
                              placeholder="Leave blank for unlimited"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                          <Button variant="outline" onClick={() => {
                            if (role.isNew) setRoles(roles.filter(r => r.id !== role.id));
                            setIsEditing(null);
                          }}>Cancel</Button>
                          <Button onClick={() => handleSave(role.id)} disabled={isLoading || !editForm.name} className="bg-purple-600">Save Role</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 h-full">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{role.name}</h3>
                          {role.maxMembers && (
                            <p className="text-xs text-slate-500 mt-0.5">Max {role.maxMembers} member{role.maxMembers > 1 ? 's' : ''} allowed</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => { setIsEditing(role.id); setEditForm(role); }} disabled={isEditing !== null}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(role.id)} disabled={isEditing !== null} className="hover:text-red-600 hover:bg-red-50 text-slate-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {categoryRoles.length === 0 && !isEditing && (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p className="text-sm text-slate-500">No roles configured for {category.label.toLowerCase()} yet.</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
