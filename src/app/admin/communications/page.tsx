import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { Badge } from "@/components/ui/badge";
import { PageHeader, TableWrap, PortalEmptyState } from "@/components/portal";

export default async function CommunicationsPage() {
  const club = await getCurrentClub();
  if (!club) return <div>Club not found</div>;

  const communications = await prisma.scheduledCommunication.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Communication History"
        description="View sent, scheduled, and failed email broadcasts."
      />

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
              <p className="text-xs text-slate-500">{new Date(comm.sendAt).toLocaleString()}</p>
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
                    {new Date(comm.sendAt).toLocaleString()}
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
