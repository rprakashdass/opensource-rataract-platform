"use client";

import { ExternalMailComposer } from "@/components/external-mail/ExternalMailComposer";
import { sendExternalMailDirect } from "@/features/external-mail/actions/sendExternalMailDirect";
import { ROUTES } from "@/lib/constants";

export default function ComposeMailForm() {
  return (
    <ExternalMailComposer
      onSubmit={sendExternalMailDirect}
      onSuccessRedirect={`${ROUTES.ADMIN}/mail-requests`}
      successMessage="Mail sent!"
      submitLabel="Send Mail"
    />
  );
}
