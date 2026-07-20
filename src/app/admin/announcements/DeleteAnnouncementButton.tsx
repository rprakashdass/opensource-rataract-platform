"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DeleteAnnouncementButton({ id, redirectAfterDelete = false }: { id: string, redirectAfterDelete?: boolean }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete announcement");
      }

      if (redirectAfterDelete) {
        router.push("/admin/announcements");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete announcement");
      setIsDeleting(false);
    }
  };

  if (redirectAfterDelete) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" />
        {isDeleting ? "Deleting..." : "Delete Announcement"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-50"
      title="Delete Announcement"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
