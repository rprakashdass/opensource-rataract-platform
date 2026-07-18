"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EventsHeader() {
  const searchParams = useSearchParams();
  const created = searchParams.get("created");

  useEffect(() => {
    if (created) {
      toast.success("Event created successfully");
    }
  }, [created]);

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" className="bg-brand hover:bg-brand-deep text-white">
        <Link href="/admin/events/create">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </Button>
      <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
        <RefreshCcw className="w-4 h-4 mr-1" /> Refresh
      </Button>
    </div>
  );
}
