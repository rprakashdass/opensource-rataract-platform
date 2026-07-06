import EventForm from "@/features/events/components/EventForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CreateEventPage(props: {
  searchParams: Promise<{ project?: string }>;
}) {
  const searchParams = await props.searchParams;
  const projectId = searchParams.project;

  const backLink = projectId ? `/admin/projects/${projectId}` : "/admin/events";
  const backText = projectId ? "Back to Project" : "Back to Events";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href={backLink} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {backText}
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedule an Event</h1>
        <p className="text-gray-500 mt-2">Create a standalone event or link it to an existing project.</p>
      </div>

      <EventForm />
    </div>
  );
}
