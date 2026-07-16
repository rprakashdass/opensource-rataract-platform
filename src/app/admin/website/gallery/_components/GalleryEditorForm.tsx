"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { Save } from "lucide-react";
import CmsPreviewFrame, { CmsPreviewFrameHandle } from "@/components/cms/CmsPreviewFrame";

export default function GalleryEditorForm({
  settings,
  albums,
}: {
  settings: any;
  albums: { id: string; title: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<CmsPreviewFrameHandle>(null);

  const [form, setForm] = useState({
    galleryTitle: settings.galleryTitle || "",
    gallerySubtitle: settings.gallerySubtitle || "",
    galleryCTA: settings.galleryCTA || "",
    galleryCTALink: settings.galleryCTALink || "",
    galleryShowLatest: settings.galleryShowLatest !== false,
    galleryShowFeatured: settings.galleryShowFeatured || false,
    galleryAlbumId: settings.galleryAlbumId || "",
    galleryLimit: settings.galleryLimit ?? 5,
  });

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const payload = useMemo(() => ({
    galleryTitle: form.galleryTitle,
    gallerySubtitle: form.gallerySubtitle,
    galleryCTA: form.galleryCTA,
    galleryCTALink: form.galleryCTALink,
  }), [form]);

  const handleSave = async () => {
    setLoading(true);
    const res = await saveWebsiteSettings({
      ...form,
      galleryAlbumId: form.galleryAlbumId || null,
      galleryLimit: Number(form.galleryLimit) || 5,
    });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Gallery settings updated!");
      previewRef.current?.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
      <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Gallery Page Hero</h4>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Title</label>
              <Input value={form.galleryTitle} onChange={e => handleChange("galleryTitle", e.target.value)} placeholder="e.g. Moments & Memories." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subtitle</label>
              <Textarea value={form.gallerySubtitle} onChange={e => handleChange("gallerySubtitle", e.target.value)} placeholder="Chronological snapshots of our fellowship..." rows={3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTA Label (optional)</label>
                <Input value={form.galleryCTA} onChange={e => handleChange("galleryCTA", e.target.value)} placeholder="e.g. Follow on Instagram" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTA Link</label>
                <Input value={form.galleryCTALink} onChange={e => handleChange("galleryCTALink", e.target.value)} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <p className="text-xs text-slate-400">The CTA button only appears on the page once a link is set.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">Homepage Photo Teaser</h4>
            <p className="text-xs text-slate-400 -mt-2">Controls which photos appear in the homepage's gallery preview section.</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Show latest first</span>
              <Switch checked={form.galleryShowLatest} onCheckedChange={c => handleChange("galleryShowLatest", c)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Only show featured photos</span>
              <Switch checked={form.galleryShowFeatured} onCheckedChange={c => handleChange("galleryShowFeatured", c)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Limit to one album (optional)</label>
              <select
                value={form.galleryAlbumId}
                onChange={e => handleChange("galleryAlbumId", e.target.value)}
                className="w-full border border-slate-300 p-2.5 rounded-xl text-sm"
              >
                <option value="">All albums</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Number of photos</label>
              <Input type="number" min={1} max={20} value={form.galleryLimit} onChange={e => handleChange("galleryLimit", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end shrink-0">
          <Button onClick={handleSave} disabled={loading} className="rounded-xl px-8">
            {loading ? "Saving..." : "Save Changes"} <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <CmsPreviewFrame ref={previewRef} previewUrl="/gallery?preview=true" channel="gallery" payload={payload} />
    </div>
  );
}
