"use client";

import { useState } from "react";
import { MediaUpload } from "@/components/ui/media-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Album {
  id: string;
  title: string;
}

interface GalleryUploadProps {
  albums: Album[];
  /** Pre-select a specific album (e.g. when triggered from the album detail page) */
  defaultAlbumId?: string;
}

export function GalleryUpload({ albums, defaultAlbumId }: GalleryUploadProps) {
  const [open, setOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(
    defaultAlbumId ?? "__none__"
  );
  const router = useRouter();

  const handleUploadComplete = (mediaId: string) => {
    if (mediaId) {
      setOpen(false);
      router.refresh();
    }
  };

  const albumId =
    selectedAlbumId === "__none__" ? null : selectedAlbumId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand hover:bg-brand-deep text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Upload Media
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload to Gallery</DialogTitle>
          <DialogDescription>
            Choose an album to organise this photo, or leave it as uncategorised.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {albums.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="album-select">Album</Label>
              <Select
                value={selectedAlbumId}
                onValueChange={setSelectedAlbumId}
              >
                <SelectTrigger id="album-select">
                  <SelectValue placeholder="Select an album…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No album (uncategorised)</SelectItem>
                  {albums.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <MediaUpload
            onChange={handleUploadComplete}
            type="IMAGE"
            usage="GALLERY"
            albumId={albumId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
