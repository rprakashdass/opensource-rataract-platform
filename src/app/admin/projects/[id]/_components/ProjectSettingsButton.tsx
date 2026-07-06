"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateProject } from "@/features/projects/actions/updateProject";
import { deleteProject } from "@/features/projects/actions/deleteProject";
import { projectSchema } from "@/features/projects/schemas/project.schema";

interface ProjectSettingsButtonProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    status: string;
    startDate: Date;
    endDate: Date | null;
    coverImage: string | null;
    visibility: string;
    impactMetrics: any;
  };
}

export default function ProjectSettingsButton({ project }: ProjectSettingsButtonProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format dates for html input (yyyy-MM-dd)
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawMetrics = formData.get("impactMetrics") as string;
    
    const data = {
      title: formData.get("title"),
      slug: undefined, // Let the action auto-generate it if needed
      description: formData.get("description"),
      category: formData.get("category"),
      status: formData.get("status"),
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string).toISOString() : "",
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string).toISOString() : null,
      coverImage: formData.get("coverImage") || undefined,
      visibility: formData.get("visibility"),
      impactMetrics: rawMetrics || null,
    };

    try {
      const parsed = projectSchema.parse(data);
      const res = await updateProject(project.id, parsed);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Project updated successfully!");
        setSheetOpen(false);
        router.refresh();
      }
    } catch (err: any) {
      if (err.issues && err.issues.length > 0) {
        toast.error("Validation error: " + err.issues[0].message);
      } else if (err.errors && err.errors.length > 0) {
        toast.error("Validation error: " + err.errors[0].message);
      } else {
        toast.error(err.message || "Failed to update project");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project? All associated events and data will be affected.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteProject(project.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Project deleted successfully!");
        router.push("/admin/projects");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
            <Settings className="w-4 h-4" />
            Project Settings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSheetOpen(true)} className="gap-2 cursor-pointer">
            <Edit2 className="w-4 h-4" /> Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-rose-600 focus:text-rose-600 gap-2 cursor-pointer">
            <Trash2 className="w-4 h-4" /> Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto max-w-lg w-full">
          <SheetHeader className="mb-6">
            <SheetTitle>Edit Project</SheetTitle>
            <SheetDescription>Update this project's core parameters, status, and timeline.</SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" name="title" defaultValue={project.title} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={project.description || ""} required className="min-h-[100px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={project.category}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMMUNITY_SERVICE">Community Service</SelectItem>
                    <SelectItem value="PROFESSIONAL_DEVELOPMENT">Professional Development</SelectItem>
                    <SelectItem value="CLUB_SERVICE">Club Service</SelectItem>
                    <SelectItem value="INTERNATIONAL_SERVICE">International Service</SelectItem>
                    <SelectItem value="FUNDRAISER">Fundraiser</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={project.status}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input type="date" id="startDate" name="startDate" defaultValue={formatDate(project.startDate)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input type="date" id="endDate" name="endDate" defaultValue={formatDate(project.endDate)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input type="url" id="coverImage" name="coverImage" defaultValue={project.coverImage || ""} placeholder="https://..." />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="visibility">Visibility</Label>
              <Select name="visibility" defaultValue={project.visibility}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public (Visible on website)</SelectItem>
                  <SelectItem value="MEMBERS_ONLY">Members Only</SelectItem>
                  <SelectItem value="BOARD_ONLY">Board Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="impactMetrics">Impact Metrics (JSON String)</Label>
              <Input 
                id="impactMetrics" 
                name="impactMetrics" 
                defaultValue={project.impactMetrics ? JSON.stringify(project.impactMetrics) : ""} 
                placeholder='e.g., {"studentsReached": 500}' 
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
