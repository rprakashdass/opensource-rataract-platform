"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { Save } from "lucide-react";
import CmsPreviewFrame, { CmsPreviewFrameHandle } from "@/components/cms/CmsPreviewFrame";

export default function EventsEditorForm({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<CmsPreviewFrameHandle>(null);

  const [form, setForm] = useState({
    eventsEyebrow: settings.eventsEyebrow || "",
    eventsSubtitle: settings.eventsSubtitle || "",
    eventsUpcomingTitle: settings.eventsUpcomingTitle || "",
    eventsCompletedTitle: settings.eventsCompletedTitle || "",
    eventsCompletedCTA: settings.eventsCompletedCTA || "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const payload = useMemo(() => form, [form]);

  const handleSave = async () => {
    setLoading(true);
    const res = await saveWebsiteSettings(form);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Events page updated!");
      previewRef.current?.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
      <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Hero</h4>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Eyebrow Label</label>
              <Input value={form.eventsEyebrow} onChange={e => handleChange("eventsEyebrow", e.target.value)} placeholder="e.g. Calendar" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subtitle</label>
              <Textarea value={form.eventsSubtitle} onChange={e => handleChange("eventsSubtitle", e.target.value)} placeholder="Discover upcoming events..." rows={3} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Section Headings</h4>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upcoming Section Title</label>
              <Input value={form.eventsUpcomingTitle} onChange={e => handleChange("eventsUpcomingTitle", e.target.value)} placeholder="e.g. Calendar & Meetings." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Completed Section Title</label>
              <Input value={form.eventsCompletedTitle} onChange={e => handleChange("eventsCompletedTitle", e.target.value)} placeholder="e.g. Completed archives." />
            </div>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end shrink-0">
          <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
            {loading ? "Saving..." : "Save Changes"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <CmsPreviewFrame ref={previewRef} previewUrl="/api/draft/enable?path=/events" channel="events" payload={payload} />
    </div>
  );
}
