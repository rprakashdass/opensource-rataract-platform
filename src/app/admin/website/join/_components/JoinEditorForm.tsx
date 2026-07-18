"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { Save } from "lucide-react";
import CmsPreviewFrame, { CmsPreviewFrameHandle } from "@/components/cms/CmsPreviewFrame";

export default function JoinEditorForm({ settings, clubName }: { settings: any; clubName: string }) {
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<CmsPreviewFrameHandle>(null);

  const [form, setForm] = useState({
    joinTitle: settings.joinTitle || "",
    joinSubtitle: settings.joinSubtitle || "",
    joinSuccessTitle: settings.joinSuccessTitle || "",
    joinSuccessDesc: settings.joinSuccessDesc || "",
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
      toast.success("Join page updated!");
      previewRef.current?.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
      <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Title</label>
              <Input value={form.joinTitle} onChange={e => handleChange("joinTitle", e.target.value)} placeholder={`e.g. Join ${clubName}`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subtitle</label>
              <Textarea value={form.joinSubtitle} onChange={e => handleChange("joinSubtitle", e.target.value)} placeholder="We are a network of young leaders..." rows={3} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Success Title (after submitting)</label>
              <Input value={form.joinSuccessTitle} onChange={e => handleChange("joinSuccessTitle", e.target.value)} placeholder="Thank you for your interest!" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Success Description</label>
              <Textarea value={form.joinSuccessDesc} onChange={e => handleChange("joinSuccessDesc", e.target.value)} placeholder="We have received your details..." rows={3} />
            </div>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end shrink-0">
          <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
            {loading ? "Saving..." : "Save Changes"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <CmsPreviewFrame ref={previewRef} previewUrl="/api/draft/enable?path=/join" channel="join" payload={payload} />
    </div>
  );
}
