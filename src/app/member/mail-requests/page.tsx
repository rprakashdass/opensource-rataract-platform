import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyExternalMailRequests } from "@/features/external-mail/queries/getExternalMailRequests";
import { MailStatusBadge } from "@/components/external-mail/MailStatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { Plus, Mail, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader, PortalEmptyState } from "@/components/portal";
import { formatRecipientsSummary } from "@/lib/format-mail-recipients";

export default async function MailRequestsPage() {
  const result = await getMyExternalMailRequests();
  if ("error" in result && result.error === "Unauthorized") redirect(ROUTES.LOGIN);

  const requests = (result as any).requests || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="External Mail Requests"
        description="Draft an email to send to someone outside the club — an admin will review and send it from the club's Gmail."
        actions={
          <Link href={`${ROUTES.DASHBOARD}/mail-requests/new`}>
            <Button className="rounded-xl bg-brand hover:bg-brand-deep text-white">
              <Plus className="w-4 h-4 mr-2" /> New Request
            </Button>
          </Link>
        }
      />

      {requests.length === 0 ? (
        <PortalEmptyState
          className="bg-white rounded-2xl border border-slate-200 border-dashed py-16"
          title="No mail requests yet"
          detail="Need to reach out to a sponsor, guest, or vendor? Draft an email here for admin approval."
          action={
            <Link href={`${ROUTES.DASHBOARD}/mail-requests/new`}>
              <Button variant="outline">Draft a mail request</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <Link key={req.id} href={`${ROUTES.DASHBOARD}/mail-requests/${req.id}`} className="block">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900 truncate">{req.subject}</h3>
                    <MailStatusBadge status={req.status} />
                  </div>
                  <p className="text-sm text-slate-500">To: {formatRecipientsSummary(req.recipients)}</p>
                  {req.status === "REJECTED" && req.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {req.rejectionReason}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    Drafted {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
