"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ProfileForm({ member }: { member: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: member.phone || "",
    bloodGroup: member.bloodGroup || "",
    profession: member.profession || "",
    companyName: member.companyName || "",
    location: member.location || "",
    bio: member.bio || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value="">Select Blood Group</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g. Software Engineer, Student"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company / University</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g. Google, Anna University"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
          placeholder="e.g. Chennai, TN"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
          placeholder="Tell us a little bit about yourself..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
