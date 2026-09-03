import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import PrintButton from "./PrintButton";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EventReportView, { type ReportData } from "./EventReportView";
import ReportEditor from "./ReportEditor";
import type { EventReportDetails } from "@/features/events/actions/saveReportDetails";
import { formatIST } from "@/lib/date-utils";

function humanize(s?: string | null) {
  if (!s) return undefined;
  return s.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

export function formatCouncil(list?: { name: string; designation?: string }[]) {
  if (!Array.isArray(list)) return undefined;
  const s = list
    .filter((c) => c?.name?.trim())
    .map((c) => (c.designation?.trim() ? `${c.name.trim()} (${c.designation.trim()})` : c.name.trim()))
    .join(", ");
  return s || undefined;
}

export default async function EventReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string; edit?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const { source, edit } = await searchParams;
  const backHref = source === "member" ? `/member/events/${id}/manage` : `/admin/events/${id}`;
  const base = `/reports/events/${id}${source ? `?source=${source}` : ""}`;
  const viewHref = base;
  const editHref = `/reports/events/${id}?${source ? `source=${source}&` : ""}edit=1`;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      club: true,
      project: true,
      members: { include: { member: { select: { name: true } } } },
      attendance: { where: { status: "PRESENT" }, select: { id: true } },
      transactions: { where: { status: "APPROVED" } },
      media: { where: { type: "IMAGE" }, orderBy: [{ includeInReport: "desc" }, { createdAt: "asc" }] },
    },
  });
  if (!event) notFound();

  const preparedBy = (await prisma.member.findUnique({ where: { userId: session.id } }))?.name || "Admin";
  const rd = ((event.reportDetails as any) || {}) as EventReportDetails;

  const namesByRole = (role: string) =>
    event.members.filter((m) => m.role === role).map((m) => m.member?.name).filter(Boolean) as string[];
  const chair = namesByRole("CHAIR")[0];
  const coChair = namesByRole("CO_CHAIR")[0];
  const volunteers = [...namesByRole("VOLUNTEER"), ...namesByRole("ORGANIZER")];

  const income = event.transactions.filter((t) => t.type === "INCOME").map((t) => ({ label: t.title, amount: Number(t.amount) }));
  const expense = event.transactions.filter((t) => t.type === "EXPENSE").map((t) => ({ label: t.title, amount: Number(t.amount) }));
  const totalIncome = income.reduce((a, t) => a + t.amount, 0);
  const totalExpense = expense.reduce((a, t) => a + t.amount, 0);

  const baseData: ReportData = {
    clubName: event.club.name,
    eventTitle: event.title,
    avenue: rd.avenue || humanize(event.type) || event.category || undefined,
    date: formatIST(event.startTime, "dd MMMM yyyy"),
    time:
      formatIST(event.startTime, "hh:mm a") +
      (event.endTime ? ` – ${formatIST(event.endTime, "hh:mm a")}` : ""),
    venue: event.location || undefined,
    chair: chair,
    secretary: rd.secretary || undefined,
    projectWith: event.project?.title || undefined,
    purpose: rd.purpose || event.description || undefined,
    beneficiaries: event.beneficiaries || undefined,
    rotaractorsCount: event.attendance.length,
    councilPresence: formatCouncil(rd.councilPresence),
    partners: rd.partners || undefined,
    objectives: (event.objectives || []).filter(Boolean),
    income,
    expense,
    totalIncome,
    totalExpense,
    profit: totalIncome - totalExpense,
    coChair,
    volunteers,
    photographer: rd.photographer || undefined,
    designer: rd.designer || undefined,
    emcee: rd.emcee || undefined,
    // Only the photos an admin explicitly curated ("Add to report") if any
    // were picked; otherwise fall back to every photo (existing behavior)
    // so events nobody has curated yet aren't left with an empty report.
    photos: (event.media.some((m) => m.includeInReport) ? event.media.filter((m) => m.includeInReport) : event.media)
      .map((m) => ({ id: m.id, url: m.url, title: m.title })),
    preparedBy,
    generatedOn: formatIST(new Date(), "dd MMMM yyyy"),
  };

  // Edit mode — split-screen live editor (admins + this event's chair/co-chair).
  if (edit === "1" && (await canManageEvent(session, id))) {
    return <ReportEditor eventId={id} baseData={baseData} initialDetails={rd} viewHref={viewHref} backHref={backHref} />;
  }

  const canEdit = await canManageEvent(session, id);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="print:hidden flex flex-wrap justify-between items-center gap-3 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <Link href={backHref} className="flex items-center text-sm font-semibold text-slate-500 hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Event
          </Link>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button variant="outline" asChild>
                <Link href={editHref}><Pencil className="w-4 h-4 mr-2" /> Edit details</Link>
              </Button>
            )}
            <PrintButton />
          </div>
        </div>
        <EventReportView data={baseData} />
      </div>
    </div>
  );
}
