import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { Badge } from "@/components/ui/badge";
import { PageHeader, TableWrap, PortalEmptyState, StatCard, StatGrid } from "@/components/portal";
import { formatIST } from "@/lib/date-utils";
import { Mail, MailCheck, MailX } from "lucide-react";

const DAYS_SHOWN = 14;

export default async function CommunicationsPage() {
  const club = await getCurrentClub();
  if (!club) return <div>Club not found</div>;

  const communications = await prisma.scheduledCommunication.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  // EmailLog isn't scoped by club — it's every sendEmail() call app-wide
  // (this is a single-club deployment, so that's equivalent in practice).
  const since = new Date();
  since.setDate(since.getDate() - DAYS_SHOWN);
  since.setHours(0, 0, 0, 0);
  const recentLogs = await prisma.emailLog.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, status: true, recipientCount: true },
    orderBy: { createdAt: "desc" },
  });

  const dayKey = (d: Date) => formatIST(d, "yyyy-MM-dd");
  const todayKey = dayKey(new Date());
  const byDay = new Map<string, { sent: number; failed: number }>();
  for (const log of recentLogs) {
    const key = dayKey(log.createdAt);
    const entry = byDay.get(key) || { sent: 0, failed: 0 };
    if (log.status === "SUCCESS") entry.sent += log.recipientCount;
    else if (log.status === "FAILED") entry.failed += log.recipientCount;
    byDay.set(key, entry);
  }
  const dailyRows = Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const entry = byDay.get(key) || { sent: 0, failed: 0 };
    return { date: d, key, ...entry };
  });
  const sentToday = byDay.get(todayKey)?.sent || 0;
  const sentThisWindow = dailyRows.reduce((a, r) => a + r.sent, 0);
  const failedThisWindow = dailyRows.reduce((a, r) => a + r.failed, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Communication History"
        description="View sent, scheduled, and failed email broadcasts."
      />

      <StatGrid className="lg:grid-cols-3">
        <StatCard label="Emails Sent Today" value={String(sentToday)} icon={Mail} />
        <StatCard label={`Sent (last ${DAYS_SHOWN} days)`} value={String(sentThisWindow)} icon={MailCheck} tone="positive" />
        <StatCard label={`Failed (last ${DAYS_SHOWN} days)`} value={String(failedThisWindow)} icon={MailX} tone={failedThisWindow > 0 ? "warning" : undefined} />
      </StatGrid>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Daily volume</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {dailyRows.map((row) => (
            <div key={row.key} className="px-6 py-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">{formatIST(row.date, "EEEE, MMM d")}</span>
              <span className="flex items-center gap-4">
                <span className="font-semibold text-slate-900">{row.sent} sent</span>
                {row.failed > 0 && <span className="font-semibold text-rose-600">{row.failed} failed</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {communications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <PortalEmptyState title="No communications found." />
        </div>
      ) : (
        <TableWrap
          mobile={communications.map((comm) => (
            <div key={comm.id} className="p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline" className={
                  comm.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  comm.status === "SENT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  "bg-rose-50 text-rose-700 border-rose-200"
                }>
                  {comm.status}
                </Badge>
                <span className="text-xs text-slate-500">
                  {/* @ts-ignore */}
                  {comm.recipientRules?.type || "ALL"}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900">{comm.subject}</p>
              {comm.errorLog && (
                <p className="text-xs text-rose-500 font-normal line-clamp-1">{comm.errorLog}</p>
              )}
              <p className="text-xs text-slate-500">{formatIST(comm.sendAt, "MMM d, yyyy, h:mm a")}</p>
            </div>
          ))}
        >
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">Schedule / Sent At</th>
                <th className="px-6 py-3 font-medium">Recipients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {communications.map((comm) => (
                <tr key={comm.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={
                      comm.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      comm.status === "SENT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      "bg-rose-50 text-rose-700 border-rose-200"
                    }>
                      {comm.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {comm.subject}
                    {comm.errorLog && (
                      <p className="text-xs text-rose-500 mt-1 font-normal line-clamp-1">{comm.errorLog}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatIST(comm.sendAt, "MMM d, yyyy, h:mm a")}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {/* @ts-ignore */}
                    {comm.recipientRules?.type || "ALL"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  );
}
