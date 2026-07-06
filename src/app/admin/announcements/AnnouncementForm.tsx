"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnnouncementType, Announcement } from "@prisma/client";
import { toast } from "sonner";

interface AnnouncementFormProps {
  initialData?: Announcement;
  clubId: string;
}

export default function AnnouncementForm({ initialData, clubId }: AnnouncementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || undefined,
      location: formData.get("location") as string,
      meetingLink: formData.get("meetingLink") as string,
      agendaUrl: formData.get("agendaUrl") as string,
      minutesUrl: formData.get("minutesUrl") as string,
      type: formData.get("type") as AnnouncementType,
      sendInvite: formData.get("sendInvite") === "on",
      clubId,
    };

    try {
      const url = initialData 
        ? `/api/admin/announcements/${initialData.id}`
        : "/api/admin/announcements";
      
      const res = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to save announcement");
      }

      toast.success(initialData ? "Announcement updated" : "Announcement created");
      router.push("/admin/announcements");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={initialData?.title}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="E.g., Monthly Board Meeting"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={initialData?.description || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="What is this announcement about?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Start Date & Time</label>
          <input
            type="datetime-local"
            name="startDate"
            required
            defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">End Date & Time (Optional)</label>
          <input
            type="datetime-local"
            name="endDate"
            defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Location (Optional)</label>
          <input
            type="text"
            name="location"
            defaultValue={initialData?.location || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="E.g., Community Center, Room 101"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Meeting Link (Optional)</label>
          <input
            type="url"
            name="meetingLink"
            defaultValue={initialData?.meetingLink || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="E.g., https://zoom.us/j/123456789"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Agenda PDF URL (Optional)</label>
          <input
            type="url"
            name="agendaUrl"
            defaultValue={initialData?.agendaUrl || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="E.g., https://your-storage.com/agenda.pdf"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Minutes PDF URL (Optional)</label>
          <input
            type="url"
            name="minutesUrl"
            defaultValue={initialData?.minutesUrl || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="E.g., https://your-storage.com/minutes.pdf"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Announcement Type</label>
          <select
            name="type"
            required
            defaultValue={initialData?.type || "MEETING"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="MEETING">Meeting</option>
            <option value="GATHERING">Gathering</option>
            <option value="DISCUSSION">Discussion</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2 flex items-center gap-3">
          <input
            type="checkbox"
            name="sendInvite"
            id="sendInvite"
            defaultChecked={initialData?.sendInvite || false}
            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="sendInvite" className="text-sm font-medium text-gray-700">
            Send email notification to all members upon saving
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Announcement" : "Create Announcement"}
        </button>
      </div>
    </form>
  );
}
