"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { WebsiteSettings } from "@prisma/client";
import { Settings } from "lucide-react";

export default function WebsiteModuleToggles({ settings }: { settings: WebsiteSettings }) {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    enableHero: settings.enableHero,
    enableImpact: settings.enableImpact,
    enableFeaturedProjects: settings.enableFeaturedProjects,
    enableEvents: settings.enableEvents,
    enableGallery: settings.enableGallery,
    enableLeadership: settings.enableLeadership,
    enableAnnouncements: settings.enableAnnouncements
  });

  const handleToggle = async (key: keyof typeof values, checked: boolean) => {
    const newValues = { ...values, [key]: checked };
    setValues(newValues);
    
    setLoading(true);
    const res = await saveWebsiteSettings({ [key]: checked });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
      setValues(values); // Revert on failure
    } else {
      toast.success("Homepage layout updated");
    }
  };

  const toggles = [
    { key: "enableHero", label: "Hero Banner" },
    { key: "enableImpact", label: "Impact Stats" },
    { key: "enableFeaturedProjects", label: "Featured Projects" },
    { key: "enableEvents", label: "Upcoming Events" },
    { key: "enableAnnouncements", label: "Noticeboard / News" },
    { key: "enableGallery", label: "Gallery Preview" },
    { key: "enableLeadership", label: "Meet The Team" },
  ] as const;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl" />
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Settings className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Homepage Layout</h2>
          <p className="text-sm text-slate-500">Enable or disable sections</p>
        </div>
      </div>

      <div className="space-y-5">
        {toggles.map(t => (
          <div key={t.key} className="flex items-center justify-between">
            <span className="text-slate-700 font-medium">{t.label}</span>
            <Switch 
              checked={values[t.key]} 
              onCheckedChange={(c) => handleToggle(t.key, c)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
