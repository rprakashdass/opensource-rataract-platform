"use client";

import React, { useState, useEffect } from "react";
import { Save, Layers, ShieldCheck, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/portal";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";
import { FileUpload } from "@/components/ui/file-upload";
import Link from "next/link";

export default function SettingsAdmin() {
  const [clubName, setClubName] = useState("");
  const [shortName, setShortName] = useState("");
  const [district, setDistrict] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [visionStatement, setVisionStatement] = useState("");
  const [presidentMessage, setPresidentMessage] = useState("");
  const [tenureYear, setTenureYear] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingVenue, setMeetingVenue] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#8B5CF6");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [youtube, setYoutube] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentQr, setPaymentQr] = useState("");
  const [loading, setLoading] = useState(true);
  useLoadingToast(loading, "Loading configurations...");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeUploads, setActiveUploads] = useState(0);

  const handleStatusChange = (newStatus: "idle" | "uploading" | "done" | "error") => {
    if (newStatus === "uploading") {
      setActiveUploads(prev => prev + 1);
    } else if (newStatus === "done" || newStatus === "error" || newStatus === "idle") {
      setActiveUploads(prev => Math.max(0, prev - 1));
    }
  };

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await fetch("/api/admin/club");
        const data = await res.json();
        if (data.name) {
          setClubName(data.name);
          setShortName(data.shortName || "");
          setDistrict(data.district || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setDescription(data.description || "");
          setMissionStatement(data.missionStatement || "");
          setVisionStatement(data.visionStatement || "");
          setPresidentMessage(data.presidentMessage || "");
          setTenureYear(data.tenureYear || "2026-27");
          setFoundedYear(data.foundedYear ? String(data.foundedYear) : "");
          setMeetingDay(data.meetingDay || "");
          setMeetingTime(data.meetingTime || "");
          setMeetingVenue(data.meetingVenue || "");
          setPrimaryColor(data.primaryColor || "#8B5CF6");
          if (data.socialMedia) {
             setInstagram(data.socialMedia.instagram || "");
             setLinkedin(data.socialMedia.linkedin || "");
             setYoutube(data.socialMedia.youtube || "");
          }
          setLogoUrl(data.logoUrl || "");
          setBannerUrl(data.bannerUrl || "");
          setUpiId(data.upiId || "");
          setPaymentQr(data.paymentQr || "");
        }
      } catch (err) {
        console.error("Error loading club details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, []);

  const handleSave = async () => {
    if (activeUploads > 0) return;
    setSaving(true);
    setMessage("");
    const toastId = toast.loading("Saving settings...");

    try {
      const res = await fetch("/api/admin/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clubName,
          shortName,
          district,
          email,
          phone,
          description,
          missionStatement,
          visionStatement,
          presidentMessage,
          tenureYear,
          foundedYear: foundedYear ? parseInt(foundedYear, 10) : null,
          meetingDay,
          meetingTime,
          meetingVenue,
          primaryColor,
          socialMedia: { instagram, linkedin, youtube },
          logoUrl,
          bannerUrl,
          upiId,
          paymentQr,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage("Club settings successfully saved to database!");
      toast.success("Settings saved successfully!", { id: toastId });
    } catch (err: any) {
      setMessage("Error saving settings: " + err.message);
      toast.error(err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "Club Info" },
    { id: "theme", label: "Identity & Theme" },
    { id: "statements", label: "About & Vision" },
    { id: "meetings", label: "Meetings" },
    { id: "socials", label: "Socials & Payments" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Club Configurations"
        description="Configure your organization and active tenure details"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/settings/portfolios">
          <div className="group border border-slate-200 bg-white p-4 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
            <div className="p-3 rounded-xl h-fit shrink-0 bg-pink-50 text-brand">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 group-hover:text-brand transition-colors">Portfolio Management</h3>
              <p className="text-sm text-slate-500 mt-1">Configure your club's avenues of service.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </Link>
        <Link href="/admin/settings/roles">
          <div className="group border border-slate-200 bg-white p-4 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-4">
            <div className="p-3 rounded-xl h-fit shrink-0 bg-indigo-100 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 group-hover:text-brand transition-colors">Board Role Configuration</h3>
              <p className="text-sm text-slate-500 mt-1">Define board, core team, and member roles.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </Link>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-slate-500 text-sm">Loading configurations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Sidebar Tabs */}
          <div className="space-y-1.5 md:sticky md:top-20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-pink-50 text-brand font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="md:col-span-3 bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
            
            {activeTab === "info" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="font-display font-bold text-lg text-slate-900 border-b pb-2">Club Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rotaract Club Name *</label>
                    <input
                      type="text"
                      required
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. Rotaract Club of Delhi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Name / Acronym</label>
                    <input
                      type="text"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. RAC Delhi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">District Number</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. 3011"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Tenure *</label>
                    <input
                      type="text"
                      required
                      value={tenureYear}
                      onChange={(e) => setTenureYear(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. 2026-27"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Founded Year</label>
                    <input
                      type="number"
                      value={foundedYear}
                      onChange={(e) => setFoundedYear(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. 1999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. contact@yourclub.org"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. +1 234 567 890"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="font-display font-bold text-lg text-slate-900 border-b pb-2">Identity & Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Club Logo</label>
                    <FileUpload value={logoUrl} onChange={setLogoUrl} accept="image/*" context={{ kind: "website" }} onStatusChange={handleStatusChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Club Banner</label>
                    <FileUpload value={bannerUrl} onChange={setBannerUrl} accept="image/*" context={{ kind: "website" }} onStatusChange={handleStatusChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Theme Color</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer border border-slate-200 p-0"
                    />
                    <span className="text-sm font-medium text-slate-700">{primaryColor}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "statements" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="font-display font-bold text-lg text-slate-900 border-b pb-2">About & Vision Statements</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Club Description / About Us</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="Brief description of your club..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mission Statement</label>
                    <textarea
                      value={missionStatement}
                      onChange={(e) => setMissionStatement(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="Our mission is..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vision Statement</label>
                    <textarea
                      value={visionStatement}
                      onChange={(e) => setVisionStatement(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="Our vision is..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">President's Message</label>
                    <textarea
                      value={presidentMessage}
                      onChange={(e) => setPresidentMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="Welcome to our club..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "meetings" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="font-display font-bold text-lg text-slate-900 border-b pb-2">Meeting Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting Day</label>
                    <input
                      type="text"
                      value={meetingDay}
                      onChange={(e) => setMeetingDay(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. Every 1st and 3rd Sunday"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting Time</label>
                    <input
                      type="text"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. 10:00 AM"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting Venue</label>
                    <input
                      type="text"
                      value={meetingVenue}
                      onChange={(e) => setMeetingVenue(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. Rotary Sadan"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "socials" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="font-display font-bold text-lg text-slate-900 border-b pb-2">Socials & UPI Payments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Instagram URL</label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">YouTube URL</label>
                    <input
                      type="url"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Club UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="e.g. rotaractclub@upi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment QR Code</label>
                    <FileUpload value={paymentQr} onChange={setPaymentQr} accept="image/*" context={{ kind: "finance" }} onStatusChange={handleStatusChange} />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSave} 
                disabled={saving || activeUploads > 0} 
                className="flex items-center gap-2 bg-brand hover:bg-brand-deep text-white px-6 py-2.5 rounded-xl font-medium transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {activeUploads > 0 ? "Uploading..." : saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
