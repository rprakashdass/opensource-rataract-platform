"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { saveClubAbout } from "@/features/public/actions/saveClubAbout";
import { toast } from "sonner";
import { Save, Globe, Layers, Info } from "lucide-react";
import Link from "next/link";
import CmsPreviewFrame, { CmsPreviewFrameHandle } from "@/components/cms/CmsPreviewFrame";
import { FileUpload } from "@/components/ui/file-upload";

interface Props {
  settings: any;
  club: any;
}

export default function AboutEditorForm({ settings, club }: Props) {
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

  const [clubForm, setClubForm] = useState({
    aboutTitle: club?.aboutTitle || "",
    aboutSubtitle: club?.aboutSubtitle || "",
    missionStatement: club?.missionStatement || "",
    visionStatement: club?.visionStatement || "",
    aboutStory: club?.aboutStory || "",
    history: club?.history || "",
    parentClubName: club?.parentClubName || "",
    parentClubDescription: club?.parentClubDescription || "",
  });

  const [settingsForm, setSettingsForm] = useState({
    aboutEyebrow: settings?.aboutEyebrow || "",
    aboutPhoto: settings?.aboutPhoto || "",
    missionQuote: settings?.missionQuote || "",
    visionQuote: settings?.visionQuote || "",
    valuesQuote: settings?.valuesQuote || "",
  });

  const handleClubChange = (field: keyof typeof clubForm, value: string) => {
    setClubForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field: keyof typeof settingsForm, value: string) => {
    setSettingsForm(prev => ({ ...prev, [field]: value }));
  };

  const previewPayload = useMemo(() => ({
    club: clubForm,
    settings: settingsForm,
  }), [clubForm, settingsForm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeUploads > 0) return;
    setLoading(true);

    const [clubRes, settingsRes] = await Promise.all([
      saveClubAbout(clubForm),
      saveWebsiteSettings(settingsForm),
    ]);

    setLoading(false);

    if (clubRes.error) {
      toast.error(clubRes.error);
    } else if (settingsRes.error) {
      toast.error(settingsRes.error);
    } else {
      toast.success("About page content saved!");
      previewRef.current?.reload();
    }
  };

  const inputClass = "w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
      <form onSubmit={handleSubmit} className="lg:col-span-5 h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-8 pr-2">

        {/* Hero Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5" onFocus={() => setActiveSection("about-hero")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-50 rounded-lg"><Info className="w-5 h-5 text-brand" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hero Section</h2>
              <p className="text-sm text-slate-500">Appears at the top of the About page.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Eyebrow Label</label>
              <input value={settingsForm.aboutEyebrow} onChange={e => handleSettingsChange("aboutEyebrow", e.target.value)} placeholder="e.g. Our Journey" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Title</label>
              <input value={clubForm.aboutTitle} onChange={e => handleClubChange("aboutTitle", e.target.value)} placeholder={`e.g. ${club?.name || "About Our Club"}`} className={inputClass} />
              <p className="text-xs text-slate-400 mt-1">Defaults to club name if left blank.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tagline / Subtitle</label>
              <input value={clubForm.aboutSubtitle} onChange={e => handleClubChange("aboutSubtitle", e.target.value)} placeholder="e.g. Service Above Self" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mission Statement</label>
              <Textarea value={clubForm.missionStatement} onChange={e => handleClubChange("missionStatement", e.target.value)} placeholder="What is your club's mission?" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vision Statement</label>
              <Textarea value={clubForm.visionStatement} onChange={e => handleClubChange("visionStatement", e.target.value)} placeholder="What is your club's long-term vision?" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hero Photo</label>
              <FileUpload value={settingsForm.aboutPhoto} onChange={url => handleSettingsChange("aboutPhoto", url)} accept="image/*" context={{ kind: "website" }} onStatusChange={handleStatusChange} />
            </div>
          </div>
        </div>

        {/* Values quote cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4" onFocus={() => setActiveSection("about-values")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><Info className="w-5 h-5 text-green-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mission, Vision & Values Cards</h2>
              <p className="text-sm text-slate-500">Short pull-quotes shown as cards on the About page. Falls back to Mission/Vision Statement above if left blank.</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mission Quote</label>
            <Textarea value={settingsForm.missionQuote} onChange={e => handleSettingsChange("missionQuote", e.target.value)} placeholder="Short mission pull-quote" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vision Quote</label>
            <Textarea value={settingsForm.visionQuote} onChange={e => handleSettingsChange("visionQuote", e.target.value)} placeholder="Short vision pull-quote" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Values Quote</label>
            <Textarea value={settingsForm.valuesQuote} onChange={e => handleSettingsChange("valuesQuote", e.target.value)} placeholder="Short values pull-quote" rows={2} />
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4" onFocus={() => setActiveSection("about-story")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><Globe className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Our Story</h2>
              <p className="text-sm text-slate-500">Share your club's founding story and journey.</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Club Story</label>
            <Textarea value={clubForm.aboutStory} onChange={e => handleClubChange("aboutStory", e.target.value)} placeholder="Write the full story of your club here..." rows={10} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">History (Timeline)</label>
            <Textarea value={clubForm.history} onChange={e => handleClubChange("history", e.target.value)} placeholder="Brief historical summary or founding year..." rows={5} />
          </div>
        </div>

        {/* Parent Club / Partner */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4" onFocus={() => setActiveSection("about-parent")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg"><Layers className="w-5 h-5 text-amber-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Parent Club / Partner Organization</h2>
              <p className="text-sm text-slate-500">Optional. Leave blank to hide this section on the About page.</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Club Name</label>
            <input value={clubForm.parentClubName} onChange={e => handleClubChange("parentClubName", e.target.value)} placeholder="e.g. Rotary Club of Chennai Central" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Club Description</label>
            <Textarea value={clubForm.parentClubDescription} onChange={e => handleClubChange("parentClubDescription", e.target.value)} placeholder="Describe your relationship with the parent club..." rows={5} />
          </div>
        </div>

        {/* Portfolios Notice */}
        <div className="bg-pink-50 border border-pink-100 p-5 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-pink-100 rounded-lg shrink-0"><Layers className="w-5 h-5 text-brand" /></div>
          <div>
            <h3 className="font-bold text-slate-900">Avenues & Portfolios</h3>
            <p className="text-sm text-slate-600 mt-1">
              The "Avenues of Service" section on the About page is driven by your Portfolio settings.
            </p>
            <Link href="/admin/settings/portfolios" className="inline-block mt-3 text-sm font-bold text-brand hover:text-brand-deep hover:underline">
              Configure Portfolios →
            </Link>
          </div>
        </div>

      </div>
      <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end shrink-0">
        <Button type="submit" disabled={loading || activeUploads > 0} className="rounded-xl px-8">
          {activeUploads > 0 ? "Uploading..." : loading ? "Saving..." : "Save Changes"} <Save className="w-4 h-4 ml-2" />
        </Button>
      </div>
      </form>

      <CmsPreviewFrame
        ref={previewRef}
        previewUrl="/api/draft/enable?path=/about"
        channel="about"
        payload={previewPayload}
        scrollTo={activeSection}
      />
    </div>
  );
}
