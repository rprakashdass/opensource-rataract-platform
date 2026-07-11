"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { deleteMedia } from "@/features/media/actions/deleteMedia";
import { toast } from "sonner";

interface MediaThumbnailProps {
  id: string;
  url: string;
  title?: string | null;
  caption?: string | null;
  type: string;
  isCover?: boolean;
  isFeatured?: boolean;
  priority?: boolean;
}

export function MediaThumbnail({ id, url, title, caption, type, isCover, isFeatured, priority }: MediaThumbnailProps) {
  const [isPending, startTransition] = useTransition();
  const [hidden, setHidden] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Delete this media item? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteMedia(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Media deleted");
        setHidden(true);
        router.refresh();
      }
    });
  };

  if (hidden) return null;

  return (
    <div className="group block">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
        {type === "IMAGE" ? (
          <Image
            src={url}
            alt={title || "Media"}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {isCover && (
          <Badge className="absolute top-2 left-2 bg-purple-500 text-white border-none shadow-sm text-[10px] px-1.5 py-0">Cover</Badge>
        )}
        {isFeatured && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white border-none shadow-sm text-[10px] px-1.5 py-0">Featured</Badge>
        )}
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {caption}
          </div>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title="Delete"
          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <span className="h-9 w-9 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-sm hover:bg-white">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </span>
        </button>
      </div>
      {title && (
        <p className="text-xs text-gray-600 mt-1 truncate px-0.5">{title}</p>
      )}
    </div>
  );
}
