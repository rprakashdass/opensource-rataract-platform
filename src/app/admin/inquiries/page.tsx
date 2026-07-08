import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import InquiryActions from "./_components/InquiryActions";

export default async function InquiriesDashboard() {
  const club = await getCurrentClub();
  if (!club) redirect("/setup");

  const inquiries = await prisma.membershipInquiry.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Membership Inquiries</h1>
        <p className="text-slate-500 mt-1">Manage leads and people interested in joining your club.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {inquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name / Contact</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Message</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map(inq => (
                  <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{inq.name}</div>
                      <div className="text-slate-500">{inq.email}</div>
                      {inq.phone && <div className="text-slate-500">{inq.phone}</div>}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-xs">
                      <p className="truncate text-slate-600">{inq.interestMessage || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        inq.status === "PENDING" ? "secondary" : 
                        inq.status === "CONTACTED" ? "default" : 
                        inq.status === "CONVERTED" ? "outline" : "destructive"
                      } className={inq.status === "CONVERTED" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                        {inq.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <InquiryActions inquiry={inq} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No inquiries yet. When someone fills out the Join form, it will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
