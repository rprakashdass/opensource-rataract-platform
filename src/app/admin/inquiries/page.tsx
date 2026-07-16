import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import InquiryActions from "./_components/InquiryActions";
import { PageHeader, TableWrap, PortalEmptyState } from "@/components/portal";

export default async function InquiriesDashboard() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const inquiries = await prisma.membershipInquiry.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership Inquiries"
        description="Manage leads and people interested in joining your club."
      />

      {inquiries.length > 0 ? (
        <TableWrap
          mobile={inquiries.map(inq => (
            <div key={inq.id} className="p-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">{inq.name}</div>
                  <div className="text-sm text-slate-500">{inq.email}</div>
                  {inq.phone && <div className="text-sm text-slate-500">{inq.phone}</div>}
                </div>
                <Badge variant={
                  inq.status === "PENDING" ? "secondary" :
                  inq.status === "CONTACTED" ? "default" :
                  inq.status === "CONVERTED" ? "outline" : "destructive"
                } className={inq.status === "CONVERTED" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                  {inq.status}
                </Badge>
              </div>
              {inq.interestMessage && (
                <p className="text-sm text-slate-600 line-clamp-2">{inq.interestMessage}</p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })}
                </span>
                <InquiryActions inquiry={inq} />
              </div>
            </div>
          ))}
        >
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Name / Contact</th>
                <th className="px-6 py-4 font-semibold">Message</th>
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
                  <td className="px-6 py-4 max-w-xs">
                    <p className="truncate text-slate-600">{inq.interestMessage || "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      inq.status === "PENDING" ? "secondary" :
                      inq.status === "CONTACTED" ? "default" :
                      inq.status === "CONVERTED" ? "outline" : "destructive"
                    } className={inq.status === "CONVERTED" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
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
        </TableWrap>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <PortalEmptyState
            title="No inquiries yet"
            detail="When someone fills out the Join form, it will appear here."
          />
        </div>
      )}
    </div>
  );
}
