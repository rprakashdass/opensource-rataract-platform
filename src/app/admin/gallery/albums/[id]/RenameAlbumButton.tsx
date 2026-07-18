"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { renameAlbum } from "../../actions";

const SYSTEM_ALBUM_TITLES = [
  "Members",
  "Announcements",
  "Website",
  "Sponsors",
  "Finance / Receipts",
  "General",
  "Memories",
];

export function RenameAlbumButton({
  albumId,
  albumTitle,
  albumDescription,
  isLinkedToEventOrProject,
}: {
  albumId: string;
  albumTitle: string;
  albumDescription?: string | null;
  isLinkedToEventOrProject: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(albumTitle);
  const [description, setDescription] = useState(albumDescription || "");
  const router = useRouter();

  const isSystemAlbum = !isLinkedToEventOrProject && SYSTEM_ALBUM_TITLES.includes(albumTitle) && albumTitle !== "Memories";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await renameAlbum(albumId, title, description);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Album updated");
        setOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update album");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="icon" title="Rename Album" className="shrink-0" onClick={() => setOpen(true)}>
        <Pencil className="w-4 h-4" />
      </Button>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Album</DialogTitle>
            <DialogDescription>Update this album's title and description.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-title">Album Title *</Label>
              <Input id="rename-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rename-description">Description</Label>
              <Textarea
                id="rename-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-24"
              />
            </div>
            {isSystemAlbum && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                This album is used automatically by uploads elsewhere in the app (matched by its exact
                name). Renaming it may cause a new "{albumTitle}" album to be created the next time
                something uploads there.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand hover:bg-brand-deep text-white" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
