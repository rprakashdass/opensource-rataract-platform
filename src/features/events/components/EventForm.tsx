"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { eventSchema } from "../schemas/event.schema";
import { createEvent } from "../actions/createEvent";
import { getActiveProjects } from "@/features/projects/actions/getActiveProjects";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function EventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProjectId = searchParams.get("project");
  
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<{id: string, title: string}[]>([]);
  const [isStandalone, setIsStandalone] = useState(!defaultProjectId);

  useEffect(() => {
    getActiveProjects().then((res) => {
      setProjects(res.projects);
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      slug: formData.get("slug") || undefined,
      description: formData.get("description"),
      type: formData.get("type"),
      status: formData.get("status"),
      startTime: formData.get("startTime") ? new Date(formData.get("startTime") as string).toISOString() : "",
      endTime: formData.get("endTime") ? new Date(formData.get("endTime") as string).toISOString() : "",
      location: formData.get("location") || null,
      coverImage: formData.get("coverImage") || undefined,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      registrationRequired: formData.get("registrationRequired") === "on",
      projectId: isStandalone ? null : formData.get("projectId") || null,
    };

    try {
      const parsed = eventSchema.parse(data);
      const res = await createEvent(parsed);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event created successfully!");
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      if (err.issues && err.issues.length > 0) {
        toast.error("Validation error: " + err.issues[0].message);
      } else if (err.errors && err.errors.length > 0) {
        toast.error("Validation error: " + err.errors[0].message);
      } else {
        toast.error(err.message || "Failed to create event");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Schedule an Event</CardTitle>
        <CardDescription>Create a standalone event or add one to an existing project.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          
          {defaultProjectId ? (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-6">
              <Label className="text-purple-900 font-bold mb-1 block">Project</Label>
              <div className="text-sm font-semibold text-purple-950 mt-1">
                {projects.find(p => p.id === defaultProjectId)?.title || "Loading project..."}
              </div>
              <input type="hidden" name="projectId" value={defaultProjectId} />
            </div>
          ) : (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-6">
              <Label className="text-purple-900 font-bold mb-3 block">Is this part of a project?</Label>
              <RadioGroup defaultValue="yes" onValueChange={(v) => setIsStandalone(v === "yes")}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="yes" id="standalone" />
                  <Label htmlFor="standalone" className="font-normal text-purple-800">No, this is a standalone event</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="project-linked" />
                  <Label htmlFor="project-linked" className="font-normal text-purple-800">Yes, select a project</Label>
                </div>
              </RadioGroup>

              {!isStandalone && (
                <div className="mt-4 pl-6">
                  <Select name="projectId" required={!isStandalone}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select active project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                      {projects.length === 0 && <SelectItem value="none" disabled>No active projects found</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" name="title" placeholder="e.g., Beach Cleanup Drive" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Event details..." required className="min-h-[100px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select name="type" defaultValue="COMMUNITY_SERVICE">
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMMUNITY_SERVICE">Community Service</SelectItem>
                  <SelectItem value="PROFESSIONAL_DEVELOPMENT">Professional Development</SelectItem>
                  <SelectItem value="CLUB_SERVICE">Club Service</SelectItem>
                  <SelectItem value="INTERNATIONAL_SERVICE">International Service</SelectItem>
                  <SelectItem value="FUNDRAISER">Fundraiser</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                  <SelectItem value="FELLOWSHIP">Fellowship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="UPCOMING">
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Date & Time</Label>
              <Input type="datetime-local" id="startTime" name="startTime" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Date & Time (Optional)</Label>
              <Input type="datetime-local" id="endTime" name="endTime" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Venue / Location</Label>
            <Input id="location" name="location" placeholder="e.g., Marina Beach" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Poster / Banner URL</Label>
            <Input type="url" id="coverImage" name="coverImage" placeholder="https://..." />
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Registration & Logistics</h3>
            
            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" id="registrationRequired" name="registrationRequired" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600" />
              <Label htmlFor="registrationRequired">Require users to register for this event</Label>
            </div>

            <div className="space-y-2 w-1/2">
              <Label htmlFor="capacity">Capacity (Optional max attendees)</Label>
              <Input type="number" id="capacity" name="capacity" placeholder="e.g., 50" min="1" />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2 bg-gray-50 p-6 rounded-b-xl border-t border-gray-100">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
