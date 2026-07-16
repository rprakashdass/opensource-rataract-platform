"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import RequestEditDialog from "../../_components/RequestEditDialog";

export default function RequestActions({
  request,
}: {
  request: {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    category: string;
    isGlobal: boolean;
    dueDate: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this payment request? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/requests/${request.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Payment request deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditing(true)}>
        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50" onClick={handleDelete} disabled={loading}>
        <Trash2 className="w-3.5 h-3.5" />
      </Button>

      {editing && (
        <RequestEditDialog
          request={request}
          onClose={() => setEditing(false)}
          onSave={() => router.refresh()}
        />
      )}
    </div>
  );
}
