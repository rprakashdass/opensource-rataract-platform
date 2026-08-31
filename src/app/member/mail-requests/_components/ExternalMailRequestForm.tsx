"use client";

import { ExternalMailComposer } from "@/components/external-mail/ExternalMailComposer";
import { createExternalMailRequest } from "@/features/external-mail/actions/createExternalMailRequest";
import { ROUTES } from "@/lib/constants";

export default function ExternalMailRequestForm() {
  return (
    <ExternalMailComposer
      onSubmit={createExternalMailRequest}
      onSuccessRedirect={`${ROUTES.DASHBOARD}/mail-requests`}
      successMessage="Mail request submitted for admin approval!"
      submitLabel="Submit for Approval"
    />
  );
}
