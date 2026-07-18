"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Trash2, Loader2, Video, FileText, MoreVertical, FolderInput, Pencil, Check } from "lucide-react";
import { deleteMedia } from "@/features/media/actions/deleteMedia";
import { updateMediaTitle } from "@/features/media/actions/updateMediaTitle";
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
  availableAlbums?: { id: string; title: string }[];
}
export function MediaThumbnail({
  id,
  url,
  title,
  caption,
  type,
  isCover,
  isFeatured,
  priority,
  availableAlbums,
}: MediaThumbnailProps) {
  const [isPending, startTransition] = useTransition();
  const [hidden, setHidden] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title || "");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const router = useRouter();

  const handleTitleSave = async () => {
    const trimmed = titleValue.trim();
    setIsEditingTitle(false);
    if (trimmed === (title || "")) return;
    setIsSavingTitle(true);
    const res = await updateMediaTitle(id, trimmed);
    setIsSavingTitle(false);
    if (res.error) {
      toast.error(res.error);
      setTitleValue(title || "");
    } else {
      toast.success("Title updated");
      router.refresh();
    }
  };

  const handleMove = (targetAlbumId: string | null) => {
    startTransition(async () => {
      try {
        const { moveMediaToAlbum } = await import("../actions");
        const res = await moveMediaToAlbum(id, targetAlbumId);
        if (res.error) toast.error(res.error);
        else {
          toast.success("Media moved successfully");
          router.refresh();
        }
      } catch (err: any) {
        toast.error("Failed to move media");
      }
    });
  };

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
        
        {availableAlbums && availableAlbums.length > 0 && (
          <div className="absolute top-2 right-12 z-20 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
             <div className="bg-white/95 rounded-full shadow-md flex items-center h-8 px-2 group/menu relative cursor-pointer hover:bg-white text-slate-600 hover:text-brand">
                <FolderInput className="w-4 h-4" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-1 hidden group-hover/menu:block z-30">
                  <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1.5">Move to Album</div>
                  <div 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMove(null); }}
                    className="px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer truncate"
                  >
                    Uncategorized
                  </div>
                  {availableAlbums.map(a => (
                    <div 
                      key={a.id}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMove(a.id); }}
                      className="px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer truncate"
                    >
                      {a.title}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}
      </div>
      {isEditingTitle ? (
        <div className="flex items-center gap-1 mt-1 px-0.5">
          <Input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setTitleValue(title || "");
                setIsEditingTitle(false);
              }
            }}
            className="h-6 text-xs px-1.5"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditingTitle(true)}
          disabled={isSavingTitle}
          className="group/title flex items-center gap-1 mt-1 px-0.5 w-full text-left"
        >
          <span className="text-xs text-slate-600 truncate font-medium">
            {isSavingTitle ? "Saving…" : title || "Untitled"}
          </span>
          {!isSavingTitle && (
            <Pencil className="w-3 h-3 text-slate-300 group-hover/title:text-slate-500 shrink-0" />
          )}
        </button>
      )}
    </div>
  );
}
