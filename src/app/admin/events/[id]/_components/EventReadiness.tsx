import { CheckCircle2, Circle } from "lucide-react";

// At-a-glance "what's left" for an event — computed from the event's own data.
// Shown on both the admin and chair manage surfaces.
export default function EventReadiness({ event }: { event: any }) {
  const rd = (event?.reportDetails as any) || {};
  const items = [
    { label: "Chair assigned", done: Array.isArray(event?.members) && event.members.some((m: any) => m.role === "CHAIR") },
    { label: "Objectives added", done: Array.isArray(event?.objectives) && event.objectives.filter(Boolean).length > 0 },
    { label: "Beneficiaries noted", done: !!(event?.beneficiaries && String(event.beneficiaries).trim()) },
    { label: "Attendance recorded", done: Array.isArray(event?.attendance) && event.attendance.length > 0 },
    { label: "Photos uploaded", done: Array.isArray(event?.media) && event.media.length > 0 },
    {
      label: "Report details filled",
      done: !!(event?.minutes?.content || rd.councilPresence?.length || rd.partners || rd.photographer || rd.designer || rd.emcee),
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Event checklist</p>
        <span className={`text-xs font-semibold ${allDone ? "text-emerald-600" : "text-slate-500"}`}>
          {allDone ? "All set" : `${doneCount}/${items.length} done`}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-sm">
            {it.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span className={it.done ? "text-slate-500 line-through" : "text-slate-700"}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
