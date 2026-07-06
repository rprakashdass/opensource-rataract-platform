import ProjectForm from "@/features/projects/components/ProjectForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateProjectPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Start a New Project</h1>
        <p className="text-gray-500 mt-2">Projects are long-running initiatives or campaigns that can house multiple events.</p>
      </div>

      <ProjectForm />
    </div>
  );
}
