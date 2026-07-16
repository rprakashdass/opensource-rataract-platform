"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { Save } from "lucide-react";
import CmsPreviewFrame, { CmsPreviewFrameHandle } from "@/components/cms/CmsPreviewFrame";

export default function ArchiveHeroForm({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<CmsPreviewFrameHandle>(null);
  const [form, setForm] = useState({
    archiveTitle: settings.archiveTitle || "",
    archiveSubtitle: settings.archiveSubtitle || "",
  });

  const payload = useMemo(() => form, [form]);

  const handleSave = async () => {
    setLoading(true);
    const res = await saveWebsiteSettings(form);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Archive page hero updated!");
      previewRef.current?.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
          "/our-archive" Page Hero
        </h4>
        <p className="text-xs text-slate-400 -mt-2">
          The full milestone timeline below is also shown, in a compact form, on the About page.
        </p>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Title</label>
          <Input value={form.archiveTitle} onChange={e => setForm(prev => ({ ...prev, archiveTitle: e.target.value }))} placeholder="e.g. Our Journey & Milestones" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subtitle</label>
          <Textarea value={form.archiveSubtitle} onChange={e => setForm(prev => ({ ...prev, archiveSubtitle: e.target.value }))} placeholder="Explore the chronological archive of campaigns..." rows={2} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} size="sm" className="rounded-xl">
            {loading ? "Saving..." : "Save"} <Save className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      </div>

      <CmsPreviewFrame ref={previewRef} previewUrl="/our-archive?preview=true" channel="archive" payload={payload} />
    </div>
  );
}
