"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { saveWebsiteMetrics } from "@/features/public/actions/saveWebsiteMetrics";
import { toast } from "sonner";
import { WebsiteSettings } from "@prisma/client";
import { Save, Layout, Palette, FileText, BarChart3, MoveUp, MoveDown, Plus, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { HomepageSectionConfig, normalizeHomepageSections } from "@/features/public/lib/homepageSections";
import CmsPreviewFrame, { CmsPreviewFrameHandle } from "@/components/cms/CmsPreviewFrame";
import { FileUpload } from "@/components/ui/file-upload";

export default function HomepageEditorForm({
  settings,
  initialMetrics,
}: {
  settings: WebsiteSettings;
  initialMetrics: any[];
}) {
  const [activeTab, setActiveTab] = useState<"layout" | "style" | "content" | "metrics">("layout");
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<CmsPreviewFrameHandle>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeUploads, setActiveUploads] = useState(0);

  const handleStatusChange = (newStatus: "idle" | "uploading" | "done" | "error") => {
    if (newStatus === "uploading") {
      setActiveUploads(prev => prev + 1);
    } else if (newStatus === "done" || newStatus === "error" || newStatus === "idle") {
      setActiveUploads(prev => Math.max(0, prev - 1));
    }
  };

  // States
  const [localSettings, setLocalSettings] = useState<any>({
    primaryColor: settings.primaryColor || "#D41367",
    secondaryColor: settings.secondaryColor || "#003DA5",
    accentColor: settings.accentColor || "#FAF9F6",
    darkColor: settings.darkColor || "#0B132B",
    lightColor: settings.lightColor || "#FAF9F6",
    heroHeadline: settings.heroHeadline || "",
    heroSubtitle: settings.heroSubtitle || "",
    heroCTA: settings.heroCTA || "",
    heroCTALink: settings.heroCTALink || "",
    heroSecondaryCTA: settings.heroSecondaryCTA || "",
    heroSecondaryCTALink: settings.heroSecondaryCTALink || "",
    heroImages: (settings.heroImages as string[]) || [],
    heroScrollAuto: (settings as any).heroScrollAuto ?? true,
    heroScrollInterval: (settings as any).heroScrollInterval ?? 5,
    presName: settings.presName || "",
    presMessage: settings.presMessage || "",
    presQuote: settings.presQuote || "",
    presPhoto: settings.presPhoto || "",
    presSignature: settings.presSignature || "",
    sponsorsTitle: settings.sponsorsTitle || "",
    sponsorsSubtitle: settings.sponsorsSubtitle || "",
    sponsorsMission: settings.sponsorsMission || "",
    sponsorsCTA: settings.sponsorsCTA || "",
    sponsorsCTALink: settings.sponsorsCTALink || "",
    sponsorsImageUrl: settings.sponsorsImageUrl || "",
  });

  const [sections, setSections] = useState<HomepageSectionConfig[]>(() =>
    normalizeHomepageSections(settings.homepageSections)
  );

  const [localMetrics, setLocalMetrics] = useState<any[]>(initialMetrics);

  // Single source shared by the live preview payload and the save call.
  const settingsPayload = useMemo(() => ({
    ...localSettings,
    homepageSections: sections.map(s => ({ id: s.id, enabled: s.enabled, order: s.order })),
    enableEvents: sections.find(s => s.id === "events_news")?.enabled !== false,
    enableAnnouncements: sections.find(s => s.id === "events_news")?.enabled !== false,
  }), [localSettings, sections]);

  // Handle setting updates
  const handleSettingChange = (field: string, value: any) => {
    setLocalSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  // Reorder sections functions
  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    // Recalculate order indices
    setSections(reordered.map((s, idx) => ({ ...s, order: idx })));
  };

  const toggleSection = (index: number) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    setSections(updated);
  };

  // Handle metrics updates
  const addMetric = () => {
    setLocalMetrics(prev => [...prev, { number: "0", label: "New Stat", description: "", enabled: true }]);
  };

  const removeMetric = (index: number) => {
    setLocalMetrics(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateMetric = (index: number, field: string, value: any) => {
    setLocalMetrics(prev => prev.map((m, idx) => idx === index ? { ...m, [field]: value } : m));
  };

  // Handle save database submit
  const handleSave = async () => {
    setLoading(true);
    try {
      const [settingsRes, metricsRes] = await Promise.all([
        saveWebsiteSettings(settingsPayload),
        saveWebsiteMetrics(localMetrics)
      ]);

      if (settingsRes.error) {
        toast.error(settingsRes.error);
      } else if (metricsRes.error) {
        toast.error(metricsRes.error);
      } else {
        toast.success("Homepage layout configurations saved successfully!");
        previewRef.current?.reload();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to persist layouts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
      {/* LEFT COLUMN: Controls form */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Sub-tabs header */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
          <button
            onClick={() => setActiveTab("layout")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all",
              activeTab === "layout" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"
            )}
          >
            <Layout className="w-4 h-4" /> Layout
          </button>
          <button
            onClick={() => setActiveTab("style")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all",
              activeTab === "style" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"
            )}
          >
            <Palette className="w-4 h-4" /> Styling
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all",
              activeTab === "content" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"
            )}
          >
            <FileText className="w-4 h-4" /> Content
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all",
              activeTab === "metrics" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"
            )}
          >
            <BarChart3 className="w-4 h-4" /> Stats
          </button>
        </div>

        {/* Scrollable control panel body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* TAB 1: SECTIONS LAYOUT AND COMPOSITION */}
          {activeTab === "layout" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Section Composer</h3>
                <p className="text-slate-400 text-xs font-medium">Toggle section visibility and customize display order.</p>
              </div>

              <div className="space-y-3">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={cn(
                      "flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all",
                      !sec.enabled && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSection(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-200 rounded-md disabled:opacity-30"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(idx, "down")}
                          disabled={idx === sections.length - 1}
                          className="p-1 hover:bg-slate-200 rounded-md disabled:opacity-30"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-none mb-1">{sec.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Position: {idx + 1}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSection(idx)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all",
                          sec.enabled ? "bg-brand/10 text-brand hover:bg-brand/20" : "bg-slate-200 text-slate-500"
                        )}
                      >
                        {sec.enabled ? "Visible" : "Hidden"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING AND COLORING */}
          {activeTab === "style" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Color Aesthetics</h3>
                <p className="text-slate-400 text-xs font-medium">Tailor the brand color theme dynamically across the public portal.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Primary Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localSettings.primaryColor}
                      onChange={e => handleSettingChange("primaryColor", e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={localSettings.primaryColor}
                      onChange={e => handleSettingChange("primaryColor", e.target.value)}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localSettings.secondaryColor}
                      onChange={e => handleSettingChange("secondaryColor", e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={localSettings.secondaryColor}
                      onChange={e => handleSettingChange("secondaryColor", e.target.value)}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Accent Strip</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localSettings.accentColor}
                      onChange={e => handleSettingChange("accentColor", e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={localSettings.accentColor}
                      onChange={e => handleSettingChange("accentColor", e.target.value)}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Background Cream</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localSettings.lightColor}
                      onChange={e => handleSettingChange("lightColor", e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={localSettings.lightColor}
                      onChange={e => handleSettingChange("lightColor", e.target.value)}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Ink Dark Text & Headings</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localSettings.darkColor}
                      onChange={e => handleSettingChange("darkColor", e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={localSettings.darkColor}
                      onChange={e => handleSettingChange("darkColor", e.target.value)}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MARKETING COPY CONTENT EDITING */}
          {activeTab === "content" && (
            <div className="space-y-6 pb-6">
              {/* HERO SECTION EDIT */}
              <div className="bg-slate-50/50 p-5 border border-slate-100 rounded-2xl space-y-4" onFocus={() => setActiveSection("hero")}>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Hero Section</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Headline Copy</label>
                  <Input
                    value={localSettings.heroHeadline}
                    onChange={e => handleSettingChange("heroHeadline", e.target.value)}
                    placeholder="Defaults to Club Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Hero Subtitle</label>
                  <Textarea
                    value={localSettings.heroSubtitle}
                    onChange={e => handleSettingChange("heroSubtitle", e.target.value)}
                    placeholder="Defaults to Mission statement"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">CTA text</label>
                    <Input
                      value={localSettings.heroCTA}
                      onChange={e => handleSettingChange("heroCTA", e.target.value)}
                      placeholder="e.g. Join Us Today"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">CTA Link</label>
                    <Input
                      value={localSettings.heroCTALink}
                      onChange={e => handleSettingChange("heroCTALink", e.target.value)}
                      placeholder="e.g. /join"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Secondary CTA text</label>
                    <Input
                      value={localSettings.heroSecondaryCTA}
                      onChange={e => handleSettingChange("heroSecondaryCTA", e.target.value)}
                      placeholder="e.g. Partner With Us"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Secondary CTA Link</label>
                    <Input
                      value={localSettings.heroSecondaryCTALink}
                      onChange={e => handleSettingChange("heroSecondaryCTALink", e.target.value)}
                      placeholder="e.g. /partner"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Auto Scroll Slideshow</label>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Automatically cycle through background photos.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.heroScrollAuto}
                      onChange={e => handleSettingChange("heroScrollAuto", e.target.checked)}
                      className="w-5 h-5 accent-brand rounded cursor-pointer"
                    />
                  </div>

                  {localSettings.heroScrollAuto && (
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Auto Scroll Interval (seconds)</label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={localSettings.heroScrollInterval}
                        onChange={e => handleSettingChange("heroScrollInterval", parseInt(e.target.value) || 5)}
                        placeholder="e.g. 5"
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Hero Slide Images</label>
                    <p className="text-[10px] text-slate-400 font-bold uppercase -mt-2">Upload multiple images to rotate in the background.</p>
                    
                    <div className="space-y-3">
                      {localSettings.heroImages.map((image: string, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = localSettings.heroImages.filter((_: any, i: number) => i !== idx);
                              handleSettingChange("heroImages", updated);
                            }}
                            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors z-10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <FileUpload
                            value={image}
                            onChange={(url) => {
                              const newImages = [...localSettings.heroImages];
                              newImages[idx] = url;
                              handleSettingChange("heroImages", newImages);
                            }}
                            accept="image/*"
                            context={{ kind: "website" }}
                            onStatusChange={handleStatusChange}
                          />
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSettingChange("heroImages", [...localSettings.heroImages, ""])}
                        className="w-full rounded-2xl flex items-center justify-center gap-1.5 h-11 border-dashed border-slate-300 hover:border-slate-400 text-xs font-bold"
                      >
                        <Plus className="w-4 h-4" /> Add Slide Image
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRESIDENT'S MESSAGE COPY */}
              <div className="bg-slate-50/50 p-5 border border-slate-100 rounded-2xl space-y-4" onFocus={() => setActiveSection("president-message")}>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">President's Message</h4>
                
                <div className="p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-800 space-y-1">
                  <p className="font-bold">Dynamic President Data Active</p>
                  <p>The President's Name and Photo are automatically pulled from the active President assigned in <span className="font-semibold">Board Management</span>, avoiding redundant schema configurations.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">President message body</label>
                  <Textarea
                    value={localSettings.presMessage}
                    onChange={e => handleSettingChange("presMessage", e.target.value)}
                    placeholder="Add a personalized welcoming note..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">President's Quote/Theme</label>
                  <Input
                    value={localSettings.presQuote}
                    onChange={e => handleSettingChange("presQuote", e.target.value)}
                    placeholder="e.g. Leadership through fellowship"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Signature Image</label>
                  <FileUpload
                    value={localSettings.presSignature}
                    onChange={(url) => handleSettingChange("presSignature", url)}
                    accept="image/*"
                    context={{ kind: "website" }}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>

              {/* CORPORATE SPONSORSHIP CTA */}
              <div className="bg-slate-50/50 p-5 border border-slate-100 rounded-2xl space-y-4" onFocus={() => setActiveSection("sponsor")}>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Sponsorship Card</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Section Title</label>
                  <Input
                    value={localSettings.sponsorsTitle}
                    onChange={e => handleSettingChange("sponsorsTitle", e.target.value)}
                    placeholder="e.g. Partner for"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Sub-heading</label>
                  <Input
                    value={localSettings.sponsorsSubtitle}
                    onChange={e => handleSettingChange("sponsorsSubtitle", e.target.value)}
                    placeholder="e.g. Global Impact."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mission Pitch</label>
                  <Textarea
                    value={localSettings.sponsorsMission}
                    onChange={e => handleSettingChange("sponsorsMission", e.target.value)}
                    placeholder="Support our community initiatives..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">CTA Label</label>
                    <Input
                      value={localSettings.sponsorsCTA}
                      onChange={e => handleSettingChange("sponsorsCTA", e.target.value)}
                      placeholder="e.g. View Packages"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">CTA Link</label>
                    <Input
                      value={localSettings.sponsorsCTALink}
                      onChange={e => handleSettingChange("sponsorsCTALink", e.target.value)}
                      placeholder="e.g. /partner"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Photo</label>
                  <FileUpload
                    value={localSettings.sponsorsImageUrl}
                    onChange={(url) => handleSettingChange("sponsorsImageUrl", url)}
                    accept="image/*"
                    context={{ kind: "website" }}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM STATS AND METRICS */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">Homepage Metrics</h3>
                  <p className="text-slate-400 text-xs font-medium">Add stats like total volunteers or project counts.</p>
                </div>
                <Button onClick={addMetric} size="sm" className="rounded-xl flex items-center gap-1.5 h-9">
                  <Plus className="w-4 h-4" /> Add Row
                </Button>
              </div>

              <div className="space-y-4">
                {localMetrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 border border-slate-100 rounded-2xl relative space-y-3">
                    <button
                      onClick={() => removeMetric(idx)}
                      className="absolute top-4 right-4 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Number/Stat</label>
                        <Input
                          value={m.number}
                          onChange={e => updateMetric(idx, "number", e.target.value)}
                          placeholder="e.g. 50+"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Label</label>
                        <Input
                          value={m.label}
                          onChange={e => updateMetric(idx, "label", e.target.value)}
                          placeholder="e.g. Active Volunters"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Brief description (optional)</label>
                      <Input
                        value={m.description || ""}
                        onChange={e => updateMetric(idx, "description", e.target.value)}
                        placeholder="e.g. operating in Coimbatore region"
                      />
                    </div>
                  </div>
                ))}

                {localMetrics.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                    No custom stats metrics configured. Fallback auto counts will show on homepage.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action button footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
          >
            Visit Live Site <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Button onClick={handleSave} disabled={loading || activeUploads > 0} className="rounded-xl px-8 hidden md:flex h-11">
            {activeUploads > 0 ? "Uploading..." : loading ? "Saving Changes..." : "Save Changes"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <CmsPreviewFrame
        ref={previewRef}
        previewUrl="/api/draft/enable?path=/"
        channel="homepage"
        payload={{ settings: settingsPayload, metrics: localMetrics }}
        scrollTo={activeSection}
      />
    </div>
  );
}
