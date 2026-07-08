"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";
import { FileUpload } from "@/components/ui/file-upload";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-black text-foreground">Club Configurations</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your organization and active tenure details</p>
        </div>
      </div>

      {message && (
        <div className="bg-primary/5 border border-primary/10 text-primary px-4 py-3 rounded-xl text-sm font-semibold">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading configurations...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card border border-primary/10 p-6 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Rotaract Club Name *</label>
              <input
                type="text"
                required
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. Rotaract Club of Delhi"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Short Name / Acronym</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. RAC Delhi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">District Number</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 3011"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Active Tenure *</label>
              <input
                type="text"
                required
                value={tenureYear}
                onChange={(e) => setTenureYear(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 2026-27"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Founded Year</label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 1999"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Club Logo</label>
              <FileUpload 
                value={logoUrl} 
                onChange={setLogoUrl} 
                accept="image/*"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Club Banner</label>
              <FileUpload 
                value={bannerUrl} 
                onChange={setBannerUrl} 
                accept="image/*"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Theme Color</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm font-medium">{primaryColor}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Contact Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. contact@yourclub.org"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. +1 234 567 890"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Club Description / About Us</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brief description of your club..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Mission Statement</label>
              <textarea
                value={missionStatement}
                onChange={(e) => setMissionStatement(e.target.value)}
                rows={2}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Our mission is..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Vision Statement</label>
              <textarea
                value={visionStatement}
                onChange={(e) => setVisionStatement(e.target.value)}
                rows={2}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Our vision is..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">President's Message</label>
              <textarea
                value={presidentMessage}
                onChange={(e) => setPresidentMessage(e.target.value)}
                rows={4}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Welcome to our club..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-primary/10">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Meeting Day</label>
              <input
                type="text"
                value={meetingDay}
                onChange={(e) => setMeetingDay(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. Every 1st and 3rd Sunday"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Meeting Time</label>
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 10:00 AM"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Meeting Venue</label>
              <input
                type="text"
                value={meetingVenue}
                onChange={(e) => setMeetingVenue(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. Rotary Sadan"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-primary/10">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Instagram URL</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">YouTube URL</label>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-primary/10">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Club UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. rotaractclub@upi"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Payment QR Code</label>
              <FileUpload 
                value={paymentQr} 
                onChange={setPaymentQr} 
                accept="image/*"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
    </div>
  );
}
