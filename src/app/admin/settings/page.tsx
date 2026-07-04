"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";

export default function SettingsAdmin() {
  const [clubName, setClubName] = useState("");
  const [district, setDistrict] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [tenureYear, setTenureYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await fetch("/api/admin/club");
        const data = await res.json();
        if (data.name) {
          setClubName(data.name);
          setDistrict(data.district || "");
          setEmail(data.email || "");
          setDescription(data.description || "");
          setTenureYear(data.tenureYear || "2026-27");
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

    try {
      const res = await fetch("/api/admin/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clubName,
          district,
          email,
          description,
          tenureYear,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage("Club settings successfully saved to database!");
    } catch (err: any) {
      setMessage("Error saving settings: " + err.message);
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">District Number</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. District 3011"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Active Tenure Year *</label>
              <input
                type="text"
                required
                value={tenureYear}
                onChange={(e) => setTenureYear(e.target.value)}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 2026-27"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Club Description / Mission</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Brief description of your club..."
            />
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
