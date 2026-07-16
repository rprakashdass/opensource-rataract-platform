import EventForm from "@/features/events/components/EventForm";
import { PageHeader } from "@/components/portal";

export default async function CreateEventPage(props: {
  searchParams: Promise<{ project?: string }>;
}) {
  const searchParams = await props.searchParams;
  const projectId = searchParams.project;

  const backLink = projectId ? `/admin/projects/${projectId}` : "/admin/events";
  const backText = projectId ? "Back to Project" : "Back to Events";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <PageHeader
        title="Schedule an Event"
        description="Create a standalone event or link it to an existing project."
        backHref={backLink}
        backLabel={backText}
      />

      <EventForm />
    </div>
  );
}
