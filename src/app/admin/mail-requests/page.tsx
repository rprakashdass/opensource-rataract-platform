import Link from "next/link";
import { getClubExternalMailRequests } from "@/features/external-mail/queries/getExternalMailRequests";
import { MailStatusBadge } from "@/components/external-mail/MailStatusBadge";
import { ROUTES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Mail, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/portal";
import { Button } from "@/components/ui/button";
import { formatRecipientsSummary } from "@/lib/format-mail-recipients";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "SENT", label: "Sent" },
  { value: "REJECTED", label: "Rejected" },
];

export default async function MailRequestsAdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const result = await getClubExternalMailRequests(status);
  const requests = (result as any).requests || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      <PageHeader
        title="External Mail Requests"
        description="Review member-drafted emails and send mail to people outside the club."
        actions={
          <Link href={`${ROUTES.ADMIN}/mail-requests/new`}>
            <Button className="rounded-xl bg-brand hover:bg-brand-deep text-white">
              <Plus className="w-4 h-4 mr-2" /> Compose Mail
            </Button>
          </Link>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `${ROUTES.ADMIN}/mail-requests?status=${tab.value}` : `${ROUTES.ADMIN}/mail-requests`}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
              (status || "") === tab.value ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req: any) => (
              <Link key={req.id} href={`${ROUTES.ADMIN}/mail-requests/${req.id}`} className="block group">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex items-center justify-between gap-6">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand transition-colors truncate">{req.subject}</h3>
                      <MailStatusBadge status={req.status} />
                    </div>
                    <p className="text-sm text-slate-500">To: {formatRecipientsSummary(req.recipients)}</p>
                    <p className="text-xs text-slate-400 font-medium">
                      {req.requestedBy ? `Drafted by ${req.requestedBy.name}` : `Sent directly by ${req.sentBy?.name || "Admin"}`}
                      {" · "}{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-500">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            No mail requests in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
