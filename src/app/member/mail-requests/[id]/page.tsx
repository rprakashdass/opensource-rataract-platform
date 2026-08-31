import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getMyExternalMailRequestById } from "@/features/external-mail/queries/getExternalMailRequests";
import { MailStatusBadge } from "@/components/external-mail/MailStatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { PageHeader } from "@/components/portal";
import { getCurrentClub } from "@/lib/club";
import { getExternalMailHtml } from "@/lib/email-templates";
import { formatRecipientsSummary } from "@/lib/format-mail-recipients";
import { MailRecipient } from "@/features/external-mail/schemas/externalMail.schema";
import { Pencil } from "lucide-react";

export default async function MyMailRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await getMyExternalMailRequestById(id);
  if ("error" in result && result.error === "Unauthorized") redirect(ROUTES.LOGIN);
  if ("error" in result && result.error) notFound();
  const request = (result as any).request;

  const recipients = (request.recipients as MailRecipient[]) || [];
  const previewGreeting =
    recipients.length <= 1 || request.deliveryMode === "SEPARATE"
      ? recipients[0]?.name || "Sir/Madam"
      : "Sir/Madam";

  const club = await getCurrentClub();
  const previewHtml = club ? getExternalMailHtml(previewGreeting, request.body, club) : null;
  const isEditable = request.status === "PENDING_APPROVAL" || request.status === "REJECTED";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={request.subject}
        description={`To: ${formatRecipientsSummary(request.recipients)}`}
        backHref={`${ROUTES.DASHBOARD}/mail-requests`}
        backLabel="Back to Mail Requests"
        actions={
          <div className="flex items-center gap-3">
            <MailStatusBadge status={request.status} />
            {isEditable && (
              <Link href={`${ROUTES.DASHBOARD}/mail-requests/${id}/edit`}>
                <Button size="sm" variant="outline" className="rounded-xl">
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> {request.status === "REJECTED" ? "Edit & Resubmit" : "Edit"}
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
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
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs font-bold text-red-400 uppercase mb-1">Rejection Reason</p>
            <p className="text-red-600 whitespace-pre-wrap">{request.rejectionReason}</p>
            <Link href={`${ROUTES.DASHBOARD}/mail-requests/${id}/edit`} className="inline-block mt-3">
              <Button size="sm" className="rounded-xl bg-brand hover:bg-brand-deep text-white">
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit & Resubmit
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
