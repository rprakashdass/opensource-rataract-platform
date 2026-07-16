"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateInquiryStatus } from "@/features/public/actions/updateInquiryStatus";
import { Check, X, Phone, UserPlus } from "lucide-react";

export default function InquiryActions({ inquiry }: { inquiry: any }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: "CONTACTED" | "CONVERTED" | "REJECTED") => {
    if (status === "CONVERTED" && !confirm("This will automatically create a Member account for them. Are you sure?")) return;
    
    setLoading(true);
    const res = await updateInquiryStatus(inquiry.id, status);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Inquiry marked as ${status.toLowerCase()}`);
    }
  };

  if (inquiry.status === "CONVERTED" || inquiry.status === "REJECTED") {
    return null; // Terminal states
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {inquiry.status === "PENDING" && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleUpdate("CONTACTED")}
          disabled={loading}
          className="rounded-lg hover:text-blue-600 hover:bg-blue-50"
        >
          <Phone className="w-4 h-4 mr-1" /> Mark Contacted
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleUpdate("CONVERTED")}
        disabled={loading}
        className="rounded-lg hover:text-emerald-600 hover:bg-emerald-50"
      >
        <UserPlus className="w-4 h-4 mr-1" /> Approve
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleUpdate("REJECTED")}
        disabled={loading}
        className="rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 h-auto"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
