import { ROUTES } from "@/lib/constants";
import { PageHeader } from "@/components/portal";
import ExternalMailRequestForm from "../_components/ExternalMailRequestForm";

export default async function NewMailRequestPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="New Mail Request"
        description="Draft an email to someone outside the club. An admin will review it before it's sent."
        backHref={`${ROUTES.DASHBOARD}/mail-requests`}
        backLabel="Back to Mail Requests"
      />

      <ExternalMailRequestForm />
    </div>
  );
}
