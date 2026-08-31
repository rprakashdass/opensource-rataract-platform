import { notFound, redirect } from "next/navigation";
import { getMyExternalMailRequestById } from "@/features/external-mail/queries/getExternalMailRequests";
import { ROUTES } from "@/lib/constants";
import { PageHeader } from "@/components/portal";
import EditMailRequestForm from "../../_components/EditMailRequestForm";

export default async function EditMailRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await getMyExternalMailRequestById(id);
  if ("error" in result && result.error === "Unauthorized") redirect(ROUTES.LOGIN);
  if ("error" in result && result.error) notFound();
  const request = (result as any).request;

  if (request.status !== "PENDING_APPROVAL" && request.status !== "REJECTED") {
    redirect(`${ROUTES.DASHBOARD}/mail-requests/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Edit Mail Request"
        description={request.status === "REJECTED" ? "Make your changes and resubmit for approval." : "Update your draft before it's reviewed."}
        backHref={`${ROUTES.DASHBOARD}/mail-requests/${id}`}
        backLabel="Back to Request"
      />

      <EditMailRequestForm
        requestId={id}
        initialData={{
          recipients: request.recipients,
          deliveryMode: request.deliveryMode,
          subject: request.subject,
          body: request.body,
        }}
      />
    </div>
  );
}
