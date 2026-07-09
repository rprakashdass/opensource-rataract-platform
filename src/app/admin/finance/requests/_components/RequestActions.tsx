"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

export default function RequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this payment request? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/requests/${requestId}`, { method: "DELETE" });
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
      <Link href={`/admin/finance/requests/${requestId}/edit`}>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
        </Button>
      </Link>
      <Button variant="outline" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={handleDelete} disabled={loading}>
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
