"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sendAnnouncement } from "@/features/communication/actions/sendAnnouncement";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";

export default function AnnouncementActions({ id, status }: { id: string, status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await sendAnnouncement(id);
      if (res.error) throw new Error(res.error);
      
      toast.success("Announcement published and emails dispatched!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  if (status === "PUBLISHED") {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg font-medium">
        <CheckCircle2 className="h-5 w-5" />
        Published & Sent
      </div>
    );
  }

  return (
    <Button onClick={handleSend} disabled={loading} className="gap-2">
      <Send className="h-4 w-4" />
      {loading ? "Sending..." : "Publish & Send Email"}
    </Button>
  );
}
