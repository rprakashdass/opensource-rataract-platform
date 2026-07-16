import ProjectForm from "@/features/projects/components/ProjectForm";
import { PageHeader } from "@/components/portal";

export default function CreateProjectPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <PageHeader
        title="Start a New Project"
        description="Projects are long-running initiatives or campaigns that can house multiple events."
        backHref="/admin/projects"
        backLabel="Back to Projects"
      />

      <ProjectForm />
    </div>
  );
}
