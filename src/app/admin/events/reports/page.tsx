import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { formatIST } from "@/lib/date-utils";
import { FileText, ArrowRight } from "lucide-react";
import { PageHeader, TableWrap, PortalEmptyState } from "@/components/portal";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  COMMUNITY_SERVICE: "Community Service",
  PROFESSIONAL_DEVELOPMENT: "Professional Dev",
  CLUB_SERVICE: "Club Service",
  INTERNATIONAL_SERVICE: "International",
  FUNDRAISER: "Fundraiser",
  MEETING: "Meeting",
  FELLOWSHIP: "Fellowship",
  DISTRICT_PRIORITY_PROJECT: "DPP",
};

export default async function EventReportsPage() {
  const club = await getCurrentClub();
  if (!club) return null;

  const events = await prisma.event.findMany({
    where: { clubId: club.id, status: { in: ["COMPLETED", "ONGOING"] } },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      startDate: true,
      reportDetails: true,
    },
  });

  const hasReportDraft = (reportDetails: unknown) =>
    !!reportDetails && Object.values(reportDetails as Record<string, unknown>).some((v) => (Array.isArray(v) ? v.length > 0 : !!v));

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <PageHeader
        title="Event Reports"
        description="Every completed event's official report, in one place."
        backHref="/admin/events"
        backLabel="Back to Events"
      />

      {events.length > 0 ? (
        <TableWrap
          mobile={events.map((event) => {
            const started = hasReportDraft(event.reportDetails);
            return (
              <Link
                key={event.id}
                href={`/reports/events/${event.id}?source=admin`}
                className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{event.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatIST(event.startDate, "MMM d, yyyy")} · {TYPE_LABELS[event.type] || event.type}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={started ? "text-emerald-700 bg-emerald-50 whitespace-nowrap" : "text-slate-500 whitespace-nowrap"}
                >
                  {started ? "Drafted" : "Not started"}
                </Badge>
              </Link>
            );
          })}
        >
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Event</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Report</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => {
                const started = hasReportDraft(event.reportDetails);
                return (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{event.title}</td>
                    <td className="px-6 py-4 text-slate-600">{TYPE_LABELS[event.type] || event.type}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatIST(event.startDate, "MMM d, yyyy")}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={started ? "text-emerald-700 bg-emerald-50" : "text-slate-500"}>
                        {started ? "Drafted" : "Not started"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/reports/events/${event.id}?source=admin`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View report
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white">
          <PortalEmptyState
            title="No event reports yet"
            detail="Reports appear here once an event is ongoing or completed."
          />
        </div>
      )}
    </div>
  );
}
