"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMember } from "@/features/members/actions/deleteMember";
import { toast } from "sonner";

export default function DeleteMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await deleteMember(memberId);
      if (res.error) throw new Error(res.error);
      
      toast.success("Member deleted successfully");
      router.push("/admin/members");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete} 
      disabled={loading}
      className="gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      Delete
    </Button>
  );
}
