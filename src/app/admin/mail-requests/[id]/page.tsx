import { notFound } from "next/navigation";
import { getExternalMailRequestForAdmin } from "@/features/external-mail/queries/getExternalMailRequests";
import { MailStatusBadge } from "@/components/external-mail/MailStatusBadge";
import { ReviewMailActions } from "../_components/ReviewMailActions";
import { ROUTES } from "@/lib/constants";
import { PageHeader } from "@/components/portal";
import { getCurrentClub } from "@/lib/club";
import { getExternalMailHtml } from "@/lib/email-templates";
import { formatRecipientsSummary } from "@/lib/format-mail-recipients";
import { MailRecipient } from "@/features/external-mail/schemas/externalMail.schema";

export default async function MailRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await getExternalMailRequestForAdmin(id);
  if ("error" in result && result.error) notFound();
  const request = (result as any).request;

  const recipients = (request.recipients as MailRecipient[]) || [];
  const previewGreeting =
    recipients.length <= 1 || request.deliveryMode === "SEPARATE"
      ? recipients[0]?.name || "Sir/Madam"
      : "Sir/Madam";

  const club = await getCurrentClub();
  const previewHtml = club ? getExternalMailHtml(previewGreeting, request.body, club) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={request.subject}
        description={request.requestedBy ? `Drafted by ${request.requestedBy.name}` : `Sent directly by ${request.sentBy?.name || "Admin"}`}
        backHref={`${ROUTES.ADMIN}/mail-requests`}
        backLabel="Back to Mail Requests"
        actions={<MailStatusBadge status={request.status} />}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">To</p>
          <p className="text-slate-700">{formatRecipientsSummary(request.recipients)}</p>
          {recipients.length > 1 && (
            <p className="text-xs text-slate-400 mt-1">Delivery mode: {request.deliveryMode}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Email Preview</p>
          {previewHtml ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white h-[400px]">
              <iframe title="Email Preview" srcDoc={previewHtml} className="w-full h-full border-none" sandbox="allow-same-origin" />
            </div>
          ) : (
            <p className="text-slate-700 whitespace-pre-wrap">{request.body}</p>
          )}
        </div>

        {request.status === "REJECTED" && request.rejectionReason && (
          <div>
            <p className="text-xs font-bold text-red-400 uppercase mb-1">Rejection Reason</p>
            <p className="text-red-600 whitespace-pre-wrap">{request.rejectionReason}</p>
          </div>
        )}
      </div>

      {request.status === "PENDING_APPROVAL" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase mb-4">Review</h2>
          <ReviewMailActions requestId={request.id} />
        </div>
      )}
    </div>
  );
}
