"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Trash2, Loader2, Video, FileText } from "lucide-react";
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
    <div className="group block relative">
      <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 block cursor-pointer"
        >
          {type === "IMAGE" ? (
            <Image
              src={url}
              alt={title || "Media"}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading={priority ? "eager" : "lazy"}
            />
          ) : type === "VIDEO_LINK" ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 transition-colors group-hover:bg-slate-900">
              <Video className="w-10 h-10 text-brand mb-2" />
              <span className="text-[10px] text-slate-400 text-center font-medium truncate w-full">Video Link</span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-700 p-4 transition-colors group-hover:bg-slate-100">
              <FileText className="w-10 h-10 text-brand mb-2" />
              <span className="text-[10px] text-slate-500 text-center font-medium truncate w-full">Document</span>
            </div>
          )}
        </a>
        
        {isCover && (
          <Badge className="absolute bottom-2 left-2 bg-brand text-white border-none shadow-sm text-[10px] px-1.5 py-0">Cover</Badge>
        )}
        {isFeatured && (
          <Badge className="absolute bottom-2 right-2 bg-amber-500 text-white border-none shadow-sm text-[10px] px-1.5 py-0">Featured</Badge>
        )}
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            {caption}
          </div>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
          disabled={isPending}
          title="Delete"
          className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-white/95 text-rose-600 flex items-center justify-center shadow-md hover:bg-white sm:opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
      {title && (
        <p className="text-xs text-slate-600 mt-1 truncate px-0.5 font-medium">{title}</p>
      )}
    </div>
  );
}
