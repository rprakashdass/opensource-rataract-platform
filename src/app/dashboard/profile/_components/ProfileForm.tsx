"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";

export default function ProfileForm({ member, onSuccess }: { member: any; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: member.phone || "",
    bloodGroup: member.bloodGroup || "",
    profession: member.profession || "",
    companyName: member.companyName || "",
    location: member.location || "",
    bio: member.bio || "",
    websiteQuote: member.websiteQuote || "",
    avatar: member.avatar || "",
    showOnWebsite: member.showOnWebsite || false,
  });
  const [activeUploads, setActiveUploads] = useState(0);

  const handleStatusChange = (newStatus: "idle" | "uploading" | "done" | "error") => {
    if (newStatus === "uploading") {
      setActiveUploads(prev => prev + 1);
    } else if (newStatus === "done" || newStatus === "error" || newStatus === "idle") {
      setActiveUploads(prev => Math.max(0, prev - 1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUploads > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture</label>
        <FileUpload 
          value={formData.avatar}
          onChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
          accept="image/*"
          context={{ kind: "members" }}
          onStatusChange={handleStatusChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm motion-input"
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white motion-input"
          >
            <option value="">Select Blood Group</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm motion-input"
            placeholder="e.g. Software Engineer, Student"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company / University</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm motion-input"
            placeholder="e.g. Google, Anna University"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm motion-input"
          placeholder="e.g. Chennai, TN"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={3}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm motion-input"
          placeholder="Tell us a little bit about yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Website Quote (Public Testimonial)</label>
        <p className="text-xs text-slate-500 mb-1.5">For Board Members: This quote is displayed publicly alongside your picture on the Team page.</p>
        <textarea
          name="websiteQuote"
          value={formData.websiteQuote}
          onChange={handleChange}
          rows={2}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm motion-input"
          placeholder="e.g. Serving as President allows me to build the future of Coimbatore..."
        />
      </div>

      <div className="flex items-center space-x-2 border p-4 rounded-md border-slate-300">
        <input 
          type="checkbox" 
          id="showOnWebsite" 
          name="showOnWebsite" 
          checked={formData.showOnWebsite}
          onChange={(e) => setFormData(prev => ({ ...prev, showOnWebsite: e.target.checked }))}
          className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
        />
        <label htmlFor="showOnWebsite" className="text-sm font-medium text-slate-700 cursor-pointer">
          Show my profile on the public website (Club Directory / Project Teams)
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || activeUploads > 0}
          className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 transition motion-button"
        >
          {activeUploads > 0 ? "Uploading..." : loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
