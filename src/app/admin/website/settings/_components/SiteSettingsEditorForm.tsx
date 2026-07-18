"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { Save, Trash2, Plus } from "lucide-react";
import CmsPreviewFrame, { CmsPreviewFrameHandle } from "@/components/cms/CmsPreviewFrame";

export default function SiteSettingsEditorForm({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<CmsPreviewFrameHandle>(null);

  const [form, setForm] = useState({
    footerDescription: settings.footerDescription || "",
    footerSocials: settings.footerSocials || { twitter: "", instagram: "", facebook: "", linkedin: "" },
    footerQuickLinks: settings.footerQuickLinks || [],
    seoTitle: settings.seoTitle || "",
    seoDescription: settings.seoDescription || "",
  });

  const payload = useMemo(() => form, [form]);

  const handleSave = async () => {
    setLoading(true);
    const res = await saveWebsiteSettings(form);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Site settings updated!");
      previewRef.current?.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
      <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Footer</h4>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <Textarea value={form.footerDescription} onChange={e => setForm(prev => ({ ...prev, footerDescription: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Twitter / X</label>
                <Input
                  value={form.footerSocials.twitter}
                  onChange={e => setForm(prev => ({ ...prev, footerSocials: { ...prev.footerSocials, twitter: e.target.value } }))}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instagram</label>
                <Input
                  value={form.footerSocials.instagram}
                  onChange={e => setForm(prev => ({ ...prev, footerSocials: { ...prev.footerSocials, instagram: e.target.value } }))}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facebook</label>
                <Input
                  value={form.footerSocials.facebook}
                  onChange={e => setForm(prev => ({ ...prev, footerSocials: { ...prev.footerSocials, facebook: e.target.value } }))}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">LinkedIn</label>
                <Input
                  value={form.footerSocials.linkedin}
                  onChange={e => setForm(prev => ({ ...prev, footerSocials: { ...prev.footerSocials, linkedin: e.target.value } }))}
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Footer Quick Links</label>
              {(form.footerQuickLinks || []).map((link: { label: string; url: string }, idx: number) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    value={link.label}
                    onChange={e => {
                      const updated = [...form.footerQuickLinks];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      setForm(prev => ({ ...prev, footerQuickLinks: updated }));
                    }}
                    placeholder="Label"
                  />
                  <Input
                    value={link.url}
                    onChange={e => {
                      const updated = [...form.footerQuickLinks];
                      updated[idx] = { ...updated[idx], url: e.target.value };
                      setForm(prev => ({ ...prev, footerQuickLinks: updated }));
                    }}
                    placeholder="/some-path"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setForm(prev => ({ ...prev, footerQuickLinks: prev.footerQuickLinks.filter((_: any, i: number) => i !== idx) }))}
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm(prev => ({ ...prev, footerQuickLinks: [...(prev.footerQuickLinks || []), { label: "", url: "" }] }))}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">SEO</h4>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SEO Title</label>
              <Input value={form.seoTitle} onChange={e => setForm(prev => ({ ...prev, seoTitle: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SEO Description</label>
              <Textarea value={form.seoDescription} onChange={e => setForm(prev => ({ ...prev, seoDescription: e.target.value }))} rows={2} />
            </div>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end shrink-0">
          <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
            {loading ? "Saving..." : "Save Changes"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <CmsPreviewFrame ref={previewRef} previewUrl="/api/draft/enable?path=/" channel="site" payload={payload} />
    </div>
  );
}
