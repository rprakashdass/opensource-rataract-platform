"use client";

import { ExternalMailComposer } from "@/components/external-mail/ExternalMailComposer";
import { updateExternalMailRequest } from "@/features/external-mail/actions/updateExternalMailRequest";
import { MailRecipient } from "@/features/external-mail/schemas/externalMail.schema";
import { ROUTES } from "@/lib/constants";

export default function EditMailRequestForm({
  requestId,
  initialData,
}: {
  requestId: string;
  initialData: { recipients: MailRecipient[]; deliveryMode: "BCC" | "CC" | "SEPARATE"; subject: string; body: string };
}) {
  return (
    <ExternalMailComposer
      initialData={initialData}
      onSubmit={(data) => updateExternalMailRequest(requestId, data)}
      onSuccessRedirect={`${ROUTES.DASHBOARD}/mail-requests/${requestId}`}
      successMessage="Mail request resubmitted for approval!"
      submitLabel="Resubmit for Approval"
    />
  );
}
