import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { Badge } from "@/components/ui/badge";

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Communication History</h1>
        <p className="text-slate-500">View sent, scheduled, and failed email broadcasts.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
            {communications.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  No communications found.
                </td>
              </tr>
            ) : (
              communications.map((comm) => (
                <tr key={comm.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={
                      comm.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      comm.status === "SENT" ? "bg-green-50 text-green-700 border-green-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    }>
                      {comm.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {comm.subject}
                    {comm.errorLog && (
                      <p className="text-xs text-red-500 mt-1 font-normal line-clamp-1">{comm.errorLog}</p>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
