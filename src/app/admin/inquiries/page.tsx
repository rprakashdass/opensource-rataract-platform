import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import InquiryActions from "./_components/InquiryActions";
import { PageHeader, TableWrap, PortalEmptyState } from "@/components/portal";
import Link from "next/link";

export default async function InquiriesDashboard({ searchParams }: { searchParams: { tab?: string } }) {
  const club = await getCurrentClub();
  if (!club) notFound();

  const tab = searchParams.tab || "all";

  let membershipInquiries: any[] = [];
  let partnerInquiries: any[] = [];

  if (tab === "all" || tab === "membership") {
    membershipInquiries = await prisma.membershipInquiry.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" }
    });
  }

  if (tab === "all" || tab === "partner") {
    partnerInquiries = await prisma.partnerInquiry.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" }
    });
  }

  const formattedMembership = membershipInquiries.map(inq => ({
    ...inq,
    type: "MEMBERSHIP" as const,
    interestMessage: inq.interestMessage,
  }));

  const formattedPartner = partnerInquiries.map(inq => ({
    ...inq,
    type: "PARTNER" as const,
    interestMessage: inq.message,
    subject: inq.subject,
    causeType: inq.causeType,
    causeId: inq.causeId,
    company: inq.company,
  }));

  const inquiries = [...formattedMembership, ...formattedPartner].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries & Leads"
        description="Manage people interested in joining your club or partnering with you."
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="?tab=all" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>All</Link>
        <Link href="?tab=membership" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === "membership" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Membership</Link>
        <Link href="?tab=partner" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === "partner" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Partner Leads</Link>
      </div>

      {inquiries.length > 0 ? (
        <TableWrap
          mobile={inquiries.map(inq => (
            <div key={`${inq.type}-${inq.id}`} className="p-4 space-y-2 border-b last:border-b-0 border-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inq.name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{inq.type}</Badge>
                  </div>
                  <div className="text-sm text-slate-500">{inq.email}</div>
                  {inq.phone && <div className="text-sm text-slate-500">{inq.phone}</div>}
                  {inq.type === "PARTNER" && inq.company && <div className="text-sm text-slate-500">{inq.company}</div>}
                </div>
                <Badge variant={
                  inq.status === "PENDING" ? "secondary" :
                  inq.status === "CONTACTED" ? "default" :
                  inq.status === "CONVERTED" ? "outline" : "destructive"
                } className={inq.status === "CONVERTED" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                  {inq.status}
                </Badge>
              </div>

              {inq.type === "PARTNER" && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {inq.subject && (
                    <span className="text-xs font-semibold bg-brand/10 text-brand px-2 py-1 rounded">
                      {inq.subject}
                    </span>
                  )}
                  {inq.causeType && inq.causeId && (
                    <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      {inq.causeType}: {inq.causeId.slice(0, 8)}
                    </span>
                  )}
                </div>
              )}

              {inq.interestMessage && (
                <p className="text-sm text-slate-600 line-clamp-2 mt-2 bg-slate-50 p-2 rounded">{inq.interestMessage}</p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-50">
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
                <th className="px-6 py-4 font-semibold">Message & Context</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inquiries.map(inq => (
                <tr key={`${inq.type}-${inq.id}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{inq.name}</span>
                    </div>
                    <div className="text-slate-500">{inq.email}</div>
                    {inq.phone && <div className="text-slate-500">{inq.phone}</div>}
                    {inq.type === "PARTNER" && inq.company && <div className="text-slate-500">{inq.company}</div>}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="mb-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{inq.type}</Badge>
                      {inq.type === "PARTNER" && inq.subject && (
                        <Badge className="text-[10px] uppercase tracking-wider bg-brand/10 text-brand hover:bg-brand/20 border-0">{inq.subject}</Badge>
                      )}
                      {inq.type === "PARTNER" && inq.causeType && inq.causeId && (
                        <Badge className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 hover:bg-amber-200 border-0">
                          {inq.causeType}
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-2 text-slate-600 max-w-md">{inq.interestMessage || "-"}</p>
                    <div className="text-xs text-slate-400 mt-2">
                      {formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <Badge variant={
                      inq.status === "PENDING" ? "secondary" :
                      inq.status === "CONTACTED" ? "default" :
                      inq.status === "CONVERTED" ? "outline" : "destructive"
                    } className={inq.status === "CONVERTED" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                      {inq.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right align-top">
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
            title="No inquiries found"
            detail="There are no inquiries matching the current filter."
          />
        </div>
      )}
    </div>
  );
}
