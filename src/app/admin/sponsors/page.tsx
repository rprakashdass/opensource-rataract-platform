"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    // In a full implementation, we'd add a GET endpoint or use server components.
    // For now, we'll keep the CMS UI simple and assume it's mostly for adding.
    // Let's add a quick mock/empty state for now or fetch if GET was implemented.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logo, website, description, year }),
      });
      
      if (!res.ok) throw new Error("Failed to add sponsor");
      
      toast.success("Sponsor added successfully!");
      setIsAdding(false);
      setName("");
      setLogo("");
      setWebsite("");
      setDescription("");
      setYear("");
      // fetchSponsors();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Sponsors & Partners</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the organizations that support your club.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : "Add Sponsor"}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-xl font-bold">New Sponsor</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Sponsor Name *</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Tenure / Year</label>
              <input 
                type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2026-27"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Website URL</label>
              <input 
                type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..."
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Description / About Partner</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Sponsor Logo</label>
              <FileUpload value={logo} onChange={setLogo} accept="image/*" />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Sponsor"}
            </Button>
          </div>
        </form>
      )}

      {/* We would list existing sponsors here */}
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
        <p className="text-slate-500 font-medium">Sponsors added will appear on the public Partnership page.</p>
      </div>
    </div>
  );
}
