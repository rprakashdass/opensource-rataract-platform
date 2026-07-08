"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { WebsiteSettings } from "@prisma/client";
import { Save } from "lucide-react";

export default function HomepageEditorForm({ settings }: { settings: WebsiteSettings }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setLoading(true);
    const res = await saveWebsiteSettings({
      heroHeadline: formData.get("heroHeadline") as string,
      heroSubtitle: formData.get("heroSubtitle") as string,
      heroCTA: formData.get("heroCTA") as string,
      seoTitle: formData.get("seoTitle") as string,
      seoDescription: formData.get("seoDescription") as string,
    });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Homepage content saved!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Hero Section</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
            <Input name="heroHeadline" defaultValue={settings.heroHeadline || ""} placeholder="e.g. Empowering Youth. Changing The World." />
            <p className="text-xs text-slate-500 mt-1">Leave blank to use your Club Name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
            <Textarea name="heroSubtitle" defaultValue={settings.heroSubtitle || ""} placeholder="e.g. Join the movement of young leaders..." rows={3} />
            <p className="text-xs text-slate-500 mt-1">Leave blank to use your Mission Statement</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Call to Action Button Text</label>
            <Input name="heroCTA" defaultValue={settings.heroCTA || ""} placeholder="e.g. Join Us Today" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Search Engine Optimization (SEO)</h2>
        <p className="text-sm text-slate-500">How your website appears on Google and social media links.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SEO Title</label>
            <Input name="seoTitle" defaultValue={settings.seoTitle || ""} placeholder="e.g. Rotaract Club of Coimbatore | Youth Leadership" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SEO Description</label>
            <Textarea name="seoDescription" defaultValue={settings.seoDescription || ""} placeholder="Brief description for search engines..." rows={2} />
          </div>
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
