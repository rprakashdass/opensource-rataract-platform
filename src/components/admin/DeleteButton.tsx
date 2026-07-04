"use client";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  endpoint: string;
  id: string;
  confirmMessage?: string;
}

export default function DeleteButton({ endpoint, id, confirmMessage = "Are you sure you want to delete this?" }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(confirmMessage)) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Deleted", { id: loadingToast });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="text-gray-400 hover:text-red-600 transition cursor-pointer" 
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
