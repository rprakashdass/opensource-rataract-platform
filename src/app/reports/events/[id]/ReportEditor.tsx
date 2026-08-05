"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Eye, ArrowLeft, Info, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EventReportView, { type ReportData } from "./EventReportView";
import { saveReportDetails, type EventReportDetails, type CouncilMember } from "@/features/events/actions/saveReportDetails";

function formatCouncil(list: CouncilMember[]) {
  const s = list
    .filter((c) => c.name?.trim())
    .map((c) => (c.designation?.trim() ? `${c.name.trim()} (${c.designation.trim()})` : c.name.trim()))
    .join(", ");
  return s || undefined;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand";

export default function ReportEditor({
  eventId,
  baseData,
  initialDetails,
  viewHref,
  backHref,
}: {
  eventId: string;
  baseData: ReportData;
  initialDetails: EventReportDetails;
  viewHref: string;
  backHref: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [avenue, setAvenue] = useState(baseData.avenue || "");
  const [purpose, setPurpose] = useState(baseData.purpose || "");
  const [secretary, setSecretary] = useState(initialDetails.secretary || "");
  const [partners, setPartners] = useState(initialDetails.partners || "");
  const [photographer, setPhotographer] = useState(initialDetails.photographer || "");
  const [designer, setDesigner] = useState(initialDetails.designer || "");
  const [emcee, setEmcee] = useState(initialDetails.emcee || "");
  const [council, setCouncil] = useState<CouncilMember[]>(
    initialDetails.councilPresence?.length ? initialDetails.councilPresence : [{ name: "", designation: "" }]
  );
  const setCouncilField = (i: number, k: keyof CouncilMember, v: string) =>
    setCouncil((prev) => prev.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)));
  const addCouncil = () => setCouncil((prev) => [...prev, { name: "", designation: "" }]);
  const removeCouncil = (i: number) => setCouncil((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  // Live preview: overlay the finishing fields onto the derived base data.
  const live: ReportData = {
    ...baseData,
    avenue: avenue || undefined,
    purpose: purpose || undefined,
    secretary: secretary || undefined,
    councilPresence: formatCouncil(council),
    partners: partners || undefined,
    photographer: photographer || undefined,
    designer: designer || undefined,
    emcee: emcee || undefined,
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveReportDetails(eventId, {
      avenue: avenue.trim() || undefined,
      purpose: purpose.trim() || undefined,
      secretary: secretary.trim() || undefined,
      councilPresence: council.filter((c) => c.name?.trim()).map((c) => ({ name: c.name.trim(), designation: c.designation?.trim() || undefined })),
      partners: partners.trim() || undefined,
      photographer: photographer.trim() || undefined,
      designer: designer.trim() || undefined,
      emcee: emcee.trim() || undefined,
    });
    setSaving(false);
    if (res?.error) return toast.error(res.error);
    toast.success("Report saved.");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-[1500px] mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <Link href={backHref} className="flex items-center text-sm font-semibold text-slate-500 hover:text-brand">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Event
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={viewHref}><Eye className="w-4 h-4 mr-2" /> View / Print</Link>
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand hover:bg-brand-deep text-white">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left: form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5 lg:sticky lg:top-6">
            {/* Pulled from the event — read-only here, edit in the event form. */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pulled from the event</p>
                <Link href={backHref} className="text-xs font-semibold text-brand hover:underline">Edit in event form</Link>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <Auto label="Date" value={baseData.date} />
                <Auto label="Time" value={baseData.time} />
                <Auto label="Venue" value={baseData.venue} />
                <Auto label="Project" value={baseData.projectWith} />
                <Auto label="Chair" value={baseData.chair} />
                <Auto label="Co-Chair" value={baseData.coChair} />
                <Auto label="Volunteers" value={baseData.volunteers.join(", ")} />
                <Auto label="Rotaractors" value={baseData.rotaractorsCount ? `${baseData.rotaractorsCount} present` : ""} />
                <Auto label="Beneficiaries" value={baseData.beneficiaries} />
                <Auto label="Objectives" value={baseData.objectives.length ? `${baseData.objectives.length} set` : ""} />
              </dl>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Fields below appear on the report. Avenue &amp; purpose are pre-filled from the event — edit them here only to override for this report.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Avenue" value={avenue} onChange={setAvenue} placeholder="e.g. Community Service" />
              <Field label="Event Secretary" value={secretary} onChange={setSecretary} placeholder="If any" />
              <Field label="Partners" value={partners} onChange={setPartners} placeholder="If any" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Purpose</label>
              <textarea rows={2} className={inputClass} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Pre-filled from the event description" />
            </div>

            {/* Council presence — repeatable (name + designation), for district-level people */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Council Presence</p>
              <p className="text-xs text-slate-400 mb-2">District / council people who attended.</p>
              <div className="space-y-2">
                {council.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className={`${inputClass} flex-1`} value={c.name} onChange={(e) => setCouncilField(i, "name", e.target.value)} placeholder="Name" />
                    <input className={`${inputClass} flex-1`} value={c.designation || ""} onChange={(e) => setCouncilField(i, "designation", e.target.value)} placeholder="Designation (e.g. DRR, ADRR)" />
                    {council.length > 1 && (
                      <button type="button" onClick={() => removeCouncil(i)} className="shrink-0 text-slate-400 hover:text-rose-600 p-1" aria-label="Remove">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addCouncil} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep">
                <Plus className="h-3.5 w-3.5" /> Add person
              </button>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Team credits</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Photographer" value={photographer} onChange={setPhotographer} />
                <Field label="Designer" value={designer} onChange={setDesigner} />
                <Field label="Emcee" value={emcee} onChange={setEmcee} />
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">Live preview</p>
            <EventReportView data={live} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Auto({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-1.5 min-w-0">
      <dt className="text-slate-400 shrink-0">{label}:</dt>
      <dd className="text-slate-700 font-medium truncate">{value || "—"}</dd>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
