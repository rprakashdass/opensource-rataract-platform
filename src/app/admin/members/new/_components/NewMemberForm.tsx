"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { createMember } from "@/features/members/actions/createMember";

interface ClubRoleOption {
  id: string;
  name: string;
  category: string;
  displayOrder: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  BOARD: "Board of Directors",
  MEMBER: "General Members",
};

export default function NewMemberForm({ roles }: { roles: ClubRoleOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    emergencyContact: "",
    profession: "",
    roleId: "",
    location: "",
    joinedAt: new Date().toISOString().split("T")[0]
  });

  const selectedRole = roles.find(r => r.id === formData.roleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createMember(formData);
      if (res.error) throw new Error(res.error);

      toast.success("Member added successfully!");
      router.push("/admin/members");
    } catch (err: any) {
      toast.error(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const groupedRoles = roles.reduce((acc, role) => {
    (acc[role.category] ||= []).push(role);
    return acc;
  }, {} as Record<string, ClubRoleOption[]>);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-100 shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="e.g. jane@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date of Joining</label>
                <input
                  type="date"
                  value={formData.joinedAt}
                  onChange={e => setFormData({...formData, joinedAt: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Club Designation (Board Role)</label>
                <select
                  value={formData.roleId}
                  onChange={e => setFormData({...formData, roleId: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                >
                  <option value="">No designation</option>
                  {Object.entries(groupedRoles).map(([category, categoryRoles]) => (
                    <optgroup key={category} label={CATEGORY_LABELS[category] || category}>
                      {categoryRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {roles.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    No roles configured yet. <Link href="/admin/settings/roles" className="underline hover:text-brand">Set up roles</Link> to enable this.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Display Order</label>
                <input
                  type="text"
                  readOnly
                  value={selectedRole ? selectedRole.displayOrder : "—"}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-sm text-slate-500 outline-none cursor-not-allowed"
                />
                <p className="text-xs text-slate-400">Set automatically from the role's order in Settings → Roles.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Profession / College</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={e => setFormData({...formData, profession: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="e.g. Software Engineer at TechCorp"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="e.g. Mumbai, India"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Emergency & Medical</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                >
                  <option value="">Select Blood Group...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Emergency Contact (Phone/Name)</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="e.g. Mom: +91 98765 43211"
                />
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex flex-wrap justify-end gap-4 mt-4">
            <Link href="/admin/members">
              <Button type="button" variant="ghost" disabled={loading}>Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-brand hover:bg-brand-deep text-white gap-2 px-8">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Member
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
