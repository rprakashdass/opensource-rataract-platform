"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { ProjectFormData, projectSchema } from "../schemas/project.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createProject } from "../actions/createProject";
import { MediaUpload } from "@/components/ui/media-upload";
import { Plus, X } from "lucide-react";

export default function ProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<{id: string, name: string}[]>([]);
  const [team, setTeam] = useState<{memberId: string, role: string}[]>([]);
  const [coverMediaId, setCoverMediaId] = useState<string>("");
  const [metrics, setMetrics] = useState<{key: string, value: string}[]>([]);
  const [submitAction, setSubmitAction] = useState<string>("DRAFT");

  useEffect(() => {
    fetch("/api/admin/members")
      .then(r => r.json())
      .then(data => {
        if(Array.isArray(data)) setMembers(data);
      })
      .catch(console.error);
  }, []);

  function getCleanErrorMessage(errStr: string) {
    try {
      if (errStr.startsWith("[") && errStr.endsWith("]")) {
        const parsed = JSON.parse(errStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].message || errStr;
        }
      }
    } catch (_) {}
    return errStr;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const impactMetricsObj = metrics.reduce((acc, curr) => {
      if (curr.key.trim() !== '') {
        const val = curr.value.trim();
        acc[curr.key.trim()] = isNaN(Number(val)) || val === "" ? val : Number(val);
      }
      return acc;
    }, {} as Record<string, any>);
    const impactMetricsJson = Object.keys(impactMetricsObj).length > 0 ? JSON.stringify(impactMetricsObj) : null;

    const data = {
      title: formData.get("title"),
      slug: formData.get("slug") || undefined,
      description: formData.get("description"),
      category: formData.get("category"),
      status: formData.get("status"),
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string).toISOString() : "",
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string).toISOString() : null,
      coverMediaId: coverMediaId || undefined,
      isFeatured: formData.get("isFeatured") === "on",
      impactSummary: formData.get("impactSummary") || undefined,
      visibility: formData.get("visibility"),
      publishStatus: submitAction,
      publishAt: formData.get("publishAt") ? new Date(formData.get("publishAt") as string).toISOString() : null,
      publishedAt: (submitAction === "PUBLISHED") ? new Date().toISOString() : null,
      impactMetrics: impactMetricsJson,
      team: team,
    };

    try {
      // Validate
      const parsed = projectSchema.parse(data);
      const res = await createProject(parsed);
      
      if (res.error) {
        toast.error(getCleanErrorMessage(res.error));
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
        toast.error(getCleanErrorMessage(err.message || "Failed to create project"));
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="coverImage">Cover Image</Label>
            <MediaUpload 
              value={coverMediaId} 
              onChange={setCoverMediaId} 
              type="IMAGE"
              usage="COVER"
              accept="image/*"
              isCover={true}
            />
            <input type="hidden" name="coverMediaId" value={coverMediaId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select name="visibility" defaultValue="PUBLIC">
              <SelectTrigger>
                <SelectValue placeholder="Select Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public (Visible on website)</SelectItem>
                <SelectItem value="INTERNAL">Internal</SelectItem>
                <SelectItem value="MEMBERS_ONLY">Members Only</SelectItem>
                <SelectItem value="BOARD_ONLY">Board Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="impactSummary">Impact Summary (Short)</Label>
            <Input id="impactSummary" name="impactSummary" placeholder="Short punchy summary for the public card" />
          </div>

          <div className="flex items-center space-x-2 border p-4 rounded-lg bg-slate-50">
            <input type="checkbox" id="isFeatured" name="isFeatured" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600" />
            <Label htmlFor="isFeatured" className="font-medium cursor-pointer">
              Feature on Homepage
            </Label>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <Label>Impact Metrics</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setMetrics([...metrics, { key: "", value: "" }])}
                className="h-8 flex items-center gap-1 text-xs"
              >
                <Plus className="w-3 h-3" /> Add Metric
              </Button>
            </div>
            {metrics.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No metrics added yet. (e.g. "Attendees: 50")</p>
            ) : (
              <div className="space-y-2">
                {metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      placeholder="Label (e.g. Trees Planted)" 
                      value={metric.key} 
                      onChange={e => {
                        const newMetrics = [...metrics];
                        newMetrics[idx].key = e.target.value;
                        setMetrics(newMetrics);
                      }} 
                      className="flex-1"
                    />
                    <Input 
                      placeholder="Value (e.g. 500)" 
                      value={metric.value} 
                      onChange={e => {
                        const newMetrics = [...metrics];
                        newMetrics[idx].value = e.target.value;
                        setMetrics(newMetrics);
                      }} 
                      className="w-1/3"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        const newMetrics = metrics.filter((_, i) => i !== idx);
                        setMetrics(newMetrics);
                      }}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6 space-y-4">
            <h3 className="text-lg font-bold">Team Assignments</h3>
            <p className="text-sm text-slate-500">Assign members to leadership and operational roles for this project.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Chair</Label>
                <Select onValueChange={(val) => {
                  setTeam(prev => {
                    const filtered = prev.filter(t => t.role !== "CHAIR");
                    return val && val !== "none" ? [...filtered, { memberId: val, role: "CHAIR" }] : filtered;
                  });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select Chair" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Co-Chair</Label>
                <Select onValueChange={(val) => {
                  setTeam(prev => {
                    const filtered = prev.filter(t => t.role !== "CO_CHAIR");
                    return val && val !== "none" ? [...filtered, { memberId: val, role: "CO_CHAIR" }] : filtered;
                  });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select Co-Chair" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Publishing & Scheduling</h3>
            <div className="space-y-2 w-full sm:w-1/2">
               <Label htmlFor="publishAt">Schedule Date & Time (Optional)</Label>
               <Input type="datetime-local" id="publishAt" name="publishAt" />
               <p className="text-xs text-gray-500">If set, the project will be automatically published at this time. Use the "Schedule" button below to save.</p>
            </div>
          </div>

        </CardContent>
        <CardFooter className="bg-gray-50 p-6 rounded-b-xl border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
            <Button variant="outline" type="button" onClick={() => router.back()} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" onClick={() => setSubmitAction("DRAFT")} variant="secondary" disabled={loading} className="w-full sm:w-auto">Save Draft</Button>
            <Button type="submit" onClick={() => setSubmitAction("SCHEDULED")} variant="outline" disabled={loading} className="border-purple-600 text-purple-600 w-full sm:w-auto">Schedule</Button>
            <Button type="submit" onClick={() => setSubmitAction("PUBLISHED")} disabled={loading} className="w-full sm:w-auto">Publish Now</Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
