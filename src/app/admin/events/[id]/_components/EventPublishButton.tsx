"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { PublishContentModal } from "@/features/publishing/components/PublishContentModal";

export default function EventPublishButton({ event, template }: { event: any, template: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-700">
        <Send className="w-4 h-4" />
        {event.publishStatus === "PUBLISHED" ? "Update Publication" : "Publish & Notify"}
      </Button>

      {open && (
        <PublishContentModal
          isOpen={open}
          onClose={() => setOpen(false)}
          entityType="EVENT"
          entityId={event.id}
          renderedSubject={template.subject}
          renderedBody={template.body}
        />
      )}
    </>
  );
}
