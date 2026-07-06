"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { ProjectFormData, projectSchema } from "../schemas/project.schema";

// We'll use native forms for simplicity if hook-form imports are not fully set up.
// Wait, I will use regular React state for simplicity and safety, and parse it with Zod.

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createProject } from "../actions/createProject";

export default function ProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      slug: formData.get("slug") || undefined,
      description: formData.get("description"),
      category: formData.get("category"),
      status: formData.get("status"),
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string).toISOString() : "",
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string).toISOString() : null,
      coverImage: formData.get("coverImage") || undefined,
      visibility: formData.get("visibility"),
      impactMetrics: formData.get("impactMetrics") || null,
    };

    try {
      // Validate
      const parsed = projectSchema.parse(data);
      const res = await createProject(parsed);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Project created successfully!");
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      if (err.issues && err.issues.length > 0) {
        toast.error("Validation error: " + err.issues[0].message);
      } else if (err.errors && err.errors.length > 0) {
        toast.error("Validation error: " + err.errors[0].message);
      } else {
        toast.error(err.message || "Failed to create project");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Setup a new long-running initiative or campaign.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" name="title" placeholder="e.g., Blood Warriors" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="What is this project about?" required className="min-h-[100px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="COMMUNITY_SERVICE">
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
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
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="ACTIVE">
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" id="startDate" name="startDate" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input type="date" id="endDate" name="endDate" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input type="url" id="coverImage" name="coverImage" placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select name="visibility" defaultValue="PUBLIC">
              <SelectTrigger>
                <SelectValue placeholder="Select Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public (Visible on website)</SelectItem>
                <SelectItem value="MEMBERS_ONLY">Members Only</SelectItem>
                <SelectItem value="BOARD_ONLY">Board Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="impactMetrics">Impact Metrics (JSON)</Label>
            <Input id="impactMetrics" name="impactMetrics" placeholder='e.g., {"studentsReached": 500}' />
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2 bg-gray-50 p-6 rounded-b-xl border-t border-gray-100">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
