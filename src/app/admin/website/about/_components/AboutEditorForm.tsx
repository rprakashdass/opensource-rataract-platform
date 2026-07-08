"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { WebsiteSettings } from "@prisma/client";
import { Save } from "lucide-react";

export default function AboutEditorForm({ settings }: { settings: WebsiteSettings }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setLoading(true);
    const res = await saveWebsiteSettings({
      aboutStory: formData.get("aboutStory") as string,
    });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("About page content saved!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Our Story</h2>
        <p className="text-sm text-slate-500">Share your club's history, founding story, and core values.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Club Story</label>
            <Textarea 
              name="aboutStory" 
              defaultValue={settings.aboutStory || ""} 
              placeholder="Write the full story of your club here..." 
              rows={12} 
            />
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
