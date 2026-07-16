"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteAlbum } from "../../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteAlbumButton({ albumId, albumTitle }: { albumId: string; albumTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await deleteAlbum(albumId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Album "${albumTitle}" deleted successfully.`);
        router.push("/admin/gallery");
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to delete album");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon" title="Delete Album" className="shrink-0">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Delete Album</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the album "{albumTitle}"? The photos inside this album will NOT be deleted, but they will become uncategorized.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleDelete();
            }} 
            disabled={loading} 
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {loading ? "Deleting..." : "Delete Album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
