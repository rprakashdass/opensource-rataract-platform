import { ROUTES } from "@/lib/constants";
import { PageHeader } from "@/components/portal";
import ComposeMailForm from "../_components/ComposeMailForm";

export default async function ComposeMailPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Compose Mail"
        description="Send an email directly to one or more people outside the club, no approval needed."
        backHref={`${ROUTES.ADMIN}/mail-requests`}
        backLabel="Back to Mail Requests"
      />

      <ComposeMailForm />
    </div>
  );
}
