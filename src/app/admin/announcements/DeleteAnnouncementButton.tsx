"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteAnnouncementButton({ id }: { id: string }) {
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

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete announcement");
    } finally {
      setIsDeleting(false);
    }
  };

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
