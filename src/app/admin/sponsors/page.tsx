"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Landmark, Award } from "lucide-react";
import { PageHeader } from "@/components/portal";
import { getFundableCauses } from "@/features/sponsors/actions/getFundableCauses";
import Link from "next/link";

export default function AdminSponsorsPage() {
  const [activeTab, setActiveTab] = useState<"sponsors" | "packages">("sponsors");
  
  // Sponsors states
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [isAddingSponsor, setIsAddingSponsor] = useState(false);
  const [isSubmittingSponsor, setIsSubmittingSponsor] = useState(false);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorLogo, setSponsorLogo] = useState("");
  const [sponsorWebsite, setSponsorWebsite] = useState("");
  const [sponsorDesc, setSponsorDesc] = useState("");
  const [sponsorYear, setSponsorYear] = useState("");
  const [activeUploads, setActiveUploads] = useState(0);

  const handleStatusChange = (newStatus: "idle" | "uploading" | "done" | "error") => {
    if (newStatus === "uploading") {
      setActiveUploads(prev => prev + 1);
    } else if (newStatus === "done" || newStatus === "error" || newStatus === "idle") {
      setActiveUploads(prev => Math.max(0, prev - 1));
    }
  };

  // Packages states
  const [packages, setPackages] = useState<any[]>([]);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);
  const [pkgTitle, setPkgTitle] = useState("");
  const [pkgAmount, setPkgAmount] = useState("");
  const [pkgImpactText, setPkgImpactText] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");

  const [causes, setCauses] = useState<any[]>([]);

  useEffect(() => {
    fetchSponsors();
    fetchPackages();
    fetchCauses();
  }, []);

  const fetchCauses = async () => {
    try {
      const res = await getFundableCauses();
      if (res.success && res.causes) {
        setCauses(res.causes);
      }
    } catch (err) {
      console.error("Failed to load causes:", err);
    }
  };

  const fetchSponsors = async () => {
    try {
      const res = await fetch("/api/admin/sponsors");
      if (res.ok) {
        const data = await res.json();
        setSponsors(data);
      }
    } catch (err) {
      console.error("Failed to load sponsors:", err);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/admin/sponsorship-packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      console.error("Failed to load packages:", err);
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUploads > 0) return;
    if (!sponsorName.trim()) return;
    setIsSubmittingSponsor(true);

    try {
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sponsorName,
          logo: sponsorLogo,
          website: sponsorWebsite,
          description: sponsorDesc,
          year: sponsorYear,
        }),
      });

      if (!res.ok) throw new Error("Failed to add sponsor");
      
      toast.success("Sponsor added successfully!");
      setIsAddingSponsor(false);
      setSponsorName("");
      setSponsorLogo("");
      setSponsorWebsite("");
      setSponsorDesc("");
      setSponsorYear("");
      fetchSponsors();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingSponsor(false);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;

    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete sponsor");

      toast.success("Sponsor deleted successfully!");
      fetchSponsors();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgTitle.trim() || !pkgAmount || !pkgImpactText.trim()) return;
    setIsSubmittingPackage(true);

    try {
      const res = await fetch("/api/admin/sponsorship-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pkgTitle,
          amount: Number(pkgAmount),
          impactText: pkgImpactText,
          description: pkgDesc,
        }),
      });

      if (!res.ok) throw new Error("Failed to create package");

      toast.success("Impact package created successfully!");
      setIsAddingPackage(false);
      setPkgTitle("");
      setPkgAmount("");
      setPkgImpactText("");
      setPkgDesc("");
      fetchPackages();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this impact package?")) return;

    try {
      const res = await fetch(`/api/admin/sponsorship-packages/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete package");

      toast.success("Impact package deleted successfully!");
      fetchPackages();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6 animate-in fade-in duration-300">
      
      <PageHeader
        title="Sponsors & CSR Tiers"
        description="Manage public patron organizations and scrollable campaign impact packages."
      />

      {causes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Causes Seeking Funding</h2>
              <p className="text-sm text-slate-500">Active projects and events currently flagged to attract sponsors.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {causes.map((cause) => (
              <div key={`${cause.causeType}-${cause.id}`} className="border border-slate-100 rounded-lg p-4 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-brand/10 text-brand">
                      {cause.causeType}
                    </span>
                    <h3 className="font-semibold text-slate-900 truncate">{cause.title}</h3>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Goal:</span>
                      <span className="font-medium text-slate-900">{cause.sponsorshipGoal ? `₹${cause.sponsorshipGoal.toLocaleString()}` : "Not specified"}</span>
                    </div>
                    {cause.causeType === "EVENT" && cause.fundsRaised !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Raised:</span>
                        <span className="font-medium text-emerald-600">{cause.fundsRaised ? `₹${cause.fundsRaised.toLocaleString()}` : "₹0"}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                  <Link 
                    href={cause.causeType === "PROJECT" ? `/admin/projects/${cause.id}` : `/admin/events/${cause.id}`}
                    className="text-xs font-semibold text-brand hover:text-brand-deep"
                  >
                    Manage settings &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex flex-wrap border-b border-slate-200/80">
        <button
          onClick={() => setActiveTab("sponsors")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "sponsors"
              ? "border-brand text-brand"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Landmark className="w-4 h-4" />
          Sponsor Logos / Patrons
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "packages"
              ? "border-brand text-brand"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          Impact Packages (CSR Tiers)
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. SPONSORS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "sponsors" && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-500">Corporate sponsor logos displayed in the website footer and partnership page.</span>
            <Button size="sm" onClick={() => setIsAddingSponsor(!isAddingSponsor)}>
              {isAddingSponsor ? "Cancel" : <><Plus className="w-4.5 h-4.5 mr-1" /> Add Sponsor</>}
            </Button>
          </div>

          {isAddingSponsor && (
            <form onSubmit={handleAddSponsor} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 border-b pb-2">New Sponsor Logo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sponsor Name *</label>
                  <input 
                    type="text" required value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tenure / Year</label>
                  <input 
                    type="text" value={sponsorYear} onChange={(e) => setSponsorYear(e.target.value)} placeholder="e.g. 2026-27"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Website URL</label>
                  <input 
                    type="url" value={sponsorWebsite} onChange={(e) => setSponsorWebsite(e.target.value)} placeholder="https://acme.org"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">About Partner (Optional)</label>
                  <textarea 
                    value={sponsorDesc} onChange={(e) => setSponsorDesc(e.target.value)} rows={2} placeholder="Brief summary of connection"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sponsor Logo</label>
                  <FileUpload value={sponsorLogo} onChange={setSponsorLogo} accept="image/*" context={{ kind: "sponsors" }} onStatusChange={handleStatusChange} />
                </div>
              </div>
              
              <div className="flex justify-end pt-2 border-t">
                <Button type="submit" disabled={isSubmittingSponsor || activeUploads > 0}>
                  {activeUploads > 0 ? "Uploading..." : isSubmittingSponsor ? "Saving..." : "Save Sponsor"}
                </Button>
              </div>
            </form>
          )}

          {sponsors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sponsors.map((s) => (
                <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {s.logo ? (
                        <img src={s.logo} alt={s.name} className="object-contain w-full h-full p-1" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{s.name.slice(0,2)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{s.name}</h4>
                      {s.year && <span className="text-[10px] text-slate-400 font-semibold">{s.year}</span>}
                    </div>
                  </div>
                  <Button 
                    variant="outline" size="icon" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-slate-200 shrink-0"
                    onClick={() => handleDeleteSponsor(s.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-bold text-sm">No sponsors listed.</p>
              <p className="text-slate-400 text-xs mt-0.5">Click "Add Sponsor" to upload partner logos.</p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PACKAGES TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "packages" && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-500">CSR impact deliverables and price tiers shown on the Partner page.</span>
            <Button size="sm" onClick={() => setIsAddingPackage(!isAddingPackage)}>
              {isAddingPackage ? "Cancel" : <><Plus className="w-4.5 h-4.5 mr-1" /> Create Tier</>}
            </Button>
          </div>

          {isAddingPackage && (
            <form onSubmit={handleAddPackage} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 border-b pb-2">New Impact Tier Package</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign Title *</label>
                  <input 
                    type="text" required value={pkgTitle} onChange={(e) => setPkgTitle(e.target.value)} placeholder="e.g. Primary School Kit Sponsor"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Contribution Amount (INR) *</label>
                  <input 
                    type="number" required value={pkgAmount} onChange={(e) => setPkgAmount(e.target.value)} placeholder="e.g. 10000"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Impact Deliverable Tag *</label>
                  <input 
                    type="text" required value={pkgImpactText} onChange={(e) => setPkgImpactText(e.target.value)} placeholder="e.g. 20+ Students Benefited"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Project Phase Description</label>
                  <textarea 
                    value={pkgDesc} onChange={(e) => setPkgDesc(e.target.value)} rows={3} placeholder="Describe exactly what this tier funds"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2 border-t">
                <Button type="submit" disabled={isSubmittingPackage}>
                  {isSubmittingPackage ? "Creating..." : "Save Impact Package"}
                </Button>
              </div>
            </form>
          )}

          {packages.length > 0 ? (
            <div className="space-y-4">
              {packages.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{p.impactText}</span>
                      <span className="text-xs font-bold text-slate-500">₹{p.amount.toLocaleString("en-IN")} package</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-base">{p.title}</h4>
                    {p.description && <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">{p.description}</p>}
                  </div>
                  <Button 
                    variant="outline" size="icon" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-slate-200 shrink-0 self-end sm:self-center"
                    onClick={() => handleDeletePackage(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-bold text-sm">No CSR Impact tiers listed.</p>
              <p className="text-slate-400 text-xs mt-0.5">Click "Create Tier" to specify prices and deliverables.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
