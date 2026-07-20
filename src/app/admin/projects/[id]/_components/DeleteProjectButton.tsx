"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteProject } from "@/features/projects/actions/deleteProject";

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting project...");
    
    try {
      const res = await deleteProject(projectId);
      if (res.error) {
        throw new Error(res.error);
      }
      toast.success("Project deleted successfully!", { id: loadingToast });
      router.push("/admin/projects");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete project", { id: loadingToast });
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Deleting..." : "Delete Project"}
    </Button>
  );
}
