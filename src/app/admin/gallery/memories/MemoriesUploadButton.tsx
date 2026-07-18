"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Uploads directly into the Memories album (auto-created on first use by
 * getOrCreateAlbum). Accepts multiple photos at once, each with its own
 * progress row, and refreshes the page once the whole batch settles.
 */
export function MemoriesUploadButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        className="bg-brand hover:bg-brand-deep text-white flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" /> Upload Memories
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload to Memories</DialogTitle>
          <DialogDescription>
            Photos go straight into the Memories album — the same source that feeds the public
            memories page and the homepage gallery section.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <MultiImageUpload context={{ kind: "memories" }} onBatchComplete={() => router.refresh()} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
