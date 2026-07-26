"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Rocket, EyeOff, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { saveWebsiteSettings } from "@/features/public/actions/saveWebsiteSettings";

// datetime-local <-> ISO helpers (input works in the admin's local timezone).
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LaunchControlForm({
  siteLive: initialLive,
  launchAt: initialLaunchAt,
}: {
  siteLive: boolean;
  launchAt: string | null;
}) {
  const router = useRouter();
  const [siteLive, setSiteLive] = useState(initialLive);
  const [launchInput, setLaunchInput] = useState(isoToLocalInput(initialLaunchAt));
  const [saving, setSaving] = useState(false);

  const launchDate = launchInput ? new Date(launchInput) : null;
  const scheduledPassed = !!launchDate && !Number.isNaN(launchDate.getTime()) && launchDate.getTime() <= Date.now();
  const isLive = siteLive || scheduledPassed;

  const handleSave = async () => {
    setSaving(true);
    const launchAt = launchInput ? new Date(launchInput).toISOString() : null;
    const res = await saveWebsiteSettings({ siteLive, launchAt });
    setSaving(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Launch settings saved.");
    router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Live status banner */}
      <div
        className={`flex items-center gap-4 rounded-2xl border p-5 ${
          isLive
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isLive ? "bg-emerald-100" : "bg-amber-100"}`}>
          {isLive ? <Rocket className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
        </div>
        <div>
          <p className="text-base font-bold">
            {isLive ? "Public site is LIVE" : "Public site is hidden"}
          </p>
          <p className="text-sm opacity-80">
            {siteLive
              ? "The “Go live now” switch is on — anyone can see the site."
              : scheduledPassed
              ? "The scheduled reveal time has passed, so the site is live."
              : "Visitors see the coming-soon teaser. You (logged in) can always preview it."}
          </p>
        </div>
      </div>

      {/* Go live now */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <p className="font-semibold text-slate-900">Go live now</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Reveal the public site immediately, ignoring any schedule. Flip off to hide it again.
          </p>
        </div>
        <Switch
          checked={siteLive}
          onCheckedChange={setSiteLive}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>

      {/* Scheduled reveal */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Scheduled reveal</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Set a date &amp; time (your local zone). The site auto-reveals when it passes, and the
              teaser shows a live countdown. Leave empty for no countdown.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="datetime-local"
                value={launchInput}
                onChange={(e) => setLaunchInput(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand"
              />
              {launchInput && (
                <button
                  type="button"
                  onClick={() => setLaunchInput("")}
                  className="text-sm font-medium text-slate-500 hover:text-brand"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-brand text-white hover:bg-brand-deep"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save launch settings
        </Button>
        <a
          href="/coming-soon"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand"
        >
          Preview teaser <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <p className="text-xs text-slate-400">
        Tip: for a permanent go-live you can also set <code className="rounded bg-slate-100 px-1 py-0.5">SITE_LIVE=true</code> in the
        environment — it overrides everything here and skips the database check entirely.
      </p>
    </div>
  );
}
