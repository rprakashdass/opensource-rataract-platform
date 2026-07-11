"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";
import { toast } from "sonner";
import { WebsiteSettings } from "@prisma/client";
import { Settings } from "lucide-react";
import { HomepageSectionConfig, normalizeHomepageSections } from "@/features/public/lib/homepageSections";

const SECTION_TOGGLES = [
  { id: "hero", label: "Hero Banner" },
  { id: "impact", label: "Impact Stats" },
  { id: "projects", label: "Featured Projects" },
  { id: "gallery", label: "Gallery Preview" },
] as const;

export default function WebsiteModuleToggles({ settings }: { settings: WebsiteSettings }) {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<HomepageSectionConfig[]>(() =>
    normalizeHomepageSections(settings.homepageSections)
  );
  const [flags, setFlags] = useState({
    enableEvents: settings.enableEvents,
    enableAnnouncements: settings.enableAnnouncements,
  });

  const handleSectionToggle = async (id: string, checked: boolean) => {
    const prevSections = sections;
    const updated = sections.map(s => (s.id === id ? { ...s, enabled: checked } : s));
    setSections(updated);

    setLoading(true);
    const res = await saveWebsiteSettings({
      homepageSections: updated.map(s => ({ id: s.id, enabled: s.enabled, order: s.order })),
    });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
      setSections(prevSections);
    } else {
      toast.success("Homepage layout updated");
    }
  };

  const handleFlagToggle = async (key: keyof typeof flags, checked: boolean) => {
    const prevFlags = flags;
    setFlags({ ...flags, [key]: checked });

    setLoading(true);
    const res = await saveWebsiteSettings({ [key]: checked });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
      setFlags(prevFlags);
    } else {
      toast.success("Homepage layout updated");
    }
  };

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
        {SECTION_TOGGLES.map(t => (
          <div key={t.id} className="flex items-center justify-between">
            <span className="text-slate-700 font-medium">{t.label}</span>
            <Switch
              checked={sections.find(s => s.id === t.id)?.enabled !== false}
              onCheckedChange={(c) => handleSectionToggle(t.id, c)}
            />
          </div>
        ))}
        <div className="flex items-center justify-between">
          <span className="text-slate-700 font-medium">Upcoming Events</span>
          <Switch checked={flags.enableEvents} onCheckedChange={(c) => handleFlagToggle("enableEvents", c)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-700 font-medium">Noticeboard / News</span>
          <Switch checked={flags.enableAnnouncements} onCheckedChange={(c) => handleFlagToggle("enableAnnouncements", c)} />
        </div>
      </div>
    </div>
  );
}
