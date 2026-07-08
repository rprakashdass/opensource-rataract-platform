"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { updateMember } from "@/features/members/actions/updateMember";
import { FileUpload } from "@/components/ui/file-upload";

export default function EditMemberForm({ member }: { member: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const activeBoard = member.boardMemberships?.find((b: any) => !b.leftAt);
  const [formData, setFormData] = useState({
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    bloodGroup: member.bloodGroup || "",
    emergencyContact: member.emergencyContact || "",
    profession: member.profession || "",
    boardRole: activeBoard?.position || "",
    boardOrder: activeBoard?.order || "99",
    location: member.location || "",
    avatar: member.avatar || "",
    joinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateMember(member.id, formData);
      if (res.error) throw new Error(res.error);
      
      toast.success("Member updated successfully!");
      router.push(`/admin/members/${member.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      <Link href={`/admin/members/${member.id}`} className="text-purple-600 hover:underline text-sm font-semibold flex items-center gap-1 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <UserPlus className="w-8 h-8 text-purple-600" />
          Edit Member Profile
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Update the member's core details and club designation.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-100 shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Profile Picture</label>
                <FileUpload 
                  value={formData.avatar}
                  onChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                  accept="image/*"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  placeholder="e.g. jane@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date of Joining</label>
                <input
                  type="date"
                  value={formData.joinedAt}
                  onChange={e => setFormData({...formData, joinedAt: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Club Designation (Board Role)</label>
                <input
                  type="text"
                  value={formData.boardRole}
                  onChange={e => setFormData({...formData, boardRole: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  placeholder="e.g. President, Secretary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Display Order</label>
                <input
                  type="number"
                  value={formData.boardOrder}
                  onChange={e => setFormData({...formData, boardOrder: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  placeholder="1, 2, 3..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Profession / College</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={e => setFormData({...formData, profession: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  placeholder="e.g. Software Engineer at TechCorp"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Emergency Contact (Phone/Name)</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  placeholder="e.g. Mom: +91 98765 43211"
                />
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <Link href={`/admin/members/${member.id}`}>
              <Button type="button" variant="ghost" disabled={loading}>Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-8">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
