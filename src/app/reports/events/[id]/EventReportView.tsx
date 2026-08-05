"use client";

export interface ReportData {
  clubName: string;
  eventTitle: string;
  // Snapshot
  avenue?: string;
  date: string;
  time: string;
  venue?: string;
  chair?: string;
  secretary?: string;
  projectWith?: string;
  // Metrics
  purpose?: string;
  beneficiaries?: string;
  rotaractorsCount: number;
  councilPresence?: string;
  partners?: string;
  // Goals
  objectives: string[];
  // Budget
  income: { label: string; amount: number }[];
  expense: { label: string; amount: number }[];
  totalIncome: number;
  totalExpense: number;
  profit: number;
  // Team
  coChair?: string;
  volunteers: string[];
  photographer?: string;
  designer?: string;
  emcee?: string;
  // Photos
  photos: { id: string; url: string; title?: string | null }[];
  preparedBy: string;
  generatedOn: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function EventReportView({ data }: { data: ReportData }) {
  return (
    <div className="bg-white print:shadow-none shadow-xl border border-slate-300 print:border-none p-8 sm:p-10 mx-auto text-sm leading-relaxed text-slate-900">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Rotaract · District 3206</p>
        <p className="mt-1 text-base font-bold text-slate-900">{data.clubName}</p>
      </div>

      <h1 className="text-center text-2xl font-black uppercase tracking-wide underline mb-8">{data.eventTitle}</h1>

      <Section n="1" title="Event Snapshot">
        <Row label="Event Avenue" value={data.avenue} />
        <Row label="Event Date" value={data.date} />
        <Row label="Event Time" value={data.time} />
        <Row label="Event Venue" value={data.venue} />
        <Row label="Event Chairman" value={data.chair} />
        {data.secretary && <Row label="Event Secretary" value={data.secretary} />}
        <Row label="Project with" value={data.projectWith} />
      </Section>

      <Section n="2" title="Event Metrics">
        <Row label="Event Purpose" value={data.purpose} />
        <Row label="Beneficiaries" value={data.beneficiaries} />
        <Row label="Rotaractors" value={data.rotaractorsCount > 0 ? `${data.rotaractorsCount} present` : undefined} />
        <Row label="Council Presence" value={data.councilPresence} />
        {data.partners && <Row label="Partners" value={data.partners} />}
      </Section>

      {data.objectives.length > 0 && (
        <Section n="3" title="Goals">
          {data.objectives.map((g, i) => (
            <Row key={i} label={`Objective ${i + 1}`} value={g} />
          ))}
        </Section>
      )}

      <Section n="4" title="Event Budget">
        <BudgetGroup title="Income" items={data.income} />
        <BudgetTotal label="Total Income" value={inr(data.totalIncome)} />
        <BudgetGroup title="Expense" items={data.expense} />
        <BudgetTotal label="Total Expense" value={inr(data.totalExpense)} />
        <BudgetTotal label="Profit" value={inr(data.profit)} strong />
      </Section>

      <Section n="5" title="Team Recognition">
        <Row label="Project Chair" value={data.chair} />
        {data.coChair && <Row label="Co-Chair" value={data.coChair} />}
        <Row label="Volunteers" value={data.volunteers.length ? data.volunteers.join(", ") : undefined} />
        {data.photographer && <Row label="Photographer" value={data.photographer} />}
        {data.designer && <Row label="Designer" value={data.designer} />}
        {data.emcee && <Row label="Emcee" value={data.emcee} />}
      </Section>

      {data.photos.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <SectionHeader n="6" title="Event Photographs" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            {data.photos.slice(0, 6).map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={m.id} src={m.url} alt={m.title || "Event photo"} className="w-full h-48 object-cover rounded border border-slate-200" />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 pt-4 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
        <span>Prepared by: {data.preparedBy}</span>
        <span>Generated: {data.generatedOn}</span>
      </div>
    </div>
  );
}

function SectionHeader({ n, title }: { n: string; title: string }) {
  return <div className="bg-slate-100 border border-slate-400 px-3 py-1.5 font-bold text-slate-900">{n}. {title}</div>;
}
function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 break-inside-avoid">
      <SectionHeader n={n} title={title} />
      <div className="border border-slate-400 border-t-0">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex border-b border-slate-300 last:border-b-0">
      <div className="w-44 shrink-0 border-r border-slate-300 px-3 py-1.5 font-bold bg-slate-50">{label}</div>
      <div className="flex-1 px-3 py-1.5 whitespace-pre-wrap">{value || "—"}</div>
    </div>
  );
}
function BudgetGroup({ title, items }: { title: string; items: { label: string; amount: number }[] }) {
  return (
    <div className="flex border-b border-slate-300">
      <div className="w-44 shrink-0 border-r border-slate-300 px-3 py-1.5 font-bold bg-slate-50">{title}</div>
      <div className="flex-1 px-3 py-1.5">
        {items.length === 0 ? (
          <span className="text-slate-400">—</span>
        ) : (
          <ul className="space-y-0.5">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>{it.label}</span>
                <span className="tabular-nums">{inr(it.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
function BudgetTotal({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex border-b border-slate-300 last:border-b-0 ${strong ? "bg-slate-100" : ""}`}>
      <div className="w-44 shrink-0 border-r border-slate-300 px-3 py-1.5 font-bold bg-slate-50">{label}</div>
      <div className={`flex-1 px-3 py-1.5 text-right tabular-nums ${strong ? "font-black" : "font-semibold"}`}>{value}</div>
    </div>
  );
}
