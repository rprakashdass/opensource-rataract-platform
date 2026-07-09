"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { saveClubAbout } from "@/features/public/actions/saveClubAbout";
import { toast } from "sonner";
import { Save, Globe, Layers, Info } from "lucide-react";
import Link from "next/link";

interface Props {
  settings: any;
  club: any;
}

export default function AboutEditorForm({ settings, club }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setLoading(true);

    // Save club about fields
    const clubRes = await saveClubAbout({
      aboutTitle: formData.get("aboutTitle") as string,
      aboutSubtitle: formData.get("aboutSubtitle") as string,
      missionStatement: formData.get("missionStatement") as string,
      visionStatement: formData.get("visionStatement") as string,
      aboutStory: formData.get("aboutStory") as string,
      history: formData.get("history") as string,
      parentClubName: formData.get("parentClubName") as string,
      parentClubDescription: formData.get("parentClubDescription") as string,
    });

    setLoading(false);

    if (clubRes.error) {
      toast.error(clubRes.error);
    } else {
      toast.success("About page content saved!");
    }
  };

  const inputClass = "w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Hero Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-50 rounded-lg"><Info className="w-5 h-5 text-purple-600" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Hero Section</h2>
            <p className="text-sm text-slate-500">Appears at the top of the About page.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Title</label>
            <input name="aboutTitle" defaultValue={club?.aboutTitle || ""} placeholder={`e.g. ${club?.name || "About Our Club"}`} className={inputClass} />
            <p className="text-xs text-slate-400 mt-1">Defaults to club name if left blank.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tagline / Subtitle</label>
            <input name="aboutSubtitle" defaultValue={club?.aboutSubtitle || ""} placeholder="e.g. Service Above Self" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mission Statement</label>
            <Textarea name="missionStatement" defaultValue={club?.missionStatement || ""} placeholder="What is your club's mission?" rows={3} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vision Statement</label>
            <Textarea name="visionStatement" defaultValue={club?.visionStatement || ""} placeholder="What is your club's long-term vision?" rows={3} />
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg"><Globe className="w-5 h-5 text-blue-600" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Our Story</h2>
            <p className="text-sm text-slate-500">Share your club's founding story and journey.</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Club Story</label>
          <Textarea name="aboutStory" defaultValue={club?.aboutStory || settings?.aboutStory || ""} placeholder="Write the full story of your club here..." rows={10} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">History (Timeline)</label>
          <Textarea name="history" defaultValue={club?.history || ""} placeholder="Brief historical summary or founding year..." rows={5} />
        </div>
      </div>

      {/* Parent Club / Partner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-50 rounded-lg"><Layers className="w-5 h-5 text-amber-600" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Parent Club / Partner Organization</h2>
            <p className="text-sm text-slate-500">Optional. Leave blank to hide this section on the About page.</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Club Name</label>
          <input name="parentClubName" defaultValue={club?.parentClubName || ""} placeholder="e.g. Rotary Club of Chennai Central" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Club Description</label>
          <Textarea name="parentClubDescription" defaultValue={club?.parentClubDescription || ""} placeholder="Describe your relationship with the parent club..." rows={5} />
        </div>
      </div>

      {/* Portfolios Notice */}
      <div className="bg-purple-50 border border-purple-100 p-5 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-purple-100 rounded-lg shrink-0"><Layers className="w-5 h-5 text-purple-600" /></div>
        <div>
          <h3 className="font-bold text-slate-900">Avenues & Portfolios</h3>
          <p className="text-sm text-slate-600 mt-1">
            The "Avenues of Service" section on the About page and homepage is driven by your Portfolio settings.
          </p>
          <Link href="/admin/settings/portfolios" className="inline-block mt-3 text-sm font-bold text-purple-700 hover:text-purple-900 hover:underline">
            Configure Portfolios →
          </Link>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="rounded-xl px-8">
          {loading ? "Saving..." : "Save Changes"} <Save className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
