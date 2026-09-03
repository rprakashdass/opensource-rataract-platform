"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Loader2, Play, Image as ImageIcon, FileImage, Upload, MoreVertical, FileText } from "lucide-react";
import { toggleMediaFeature, deleteEventMedia, setEventMediaRole, toggleMediaReportInclusion } from "@/features/events/actions/manageEventMedia";
import { uploadMedia } from "@/features/media/actions/uploadMedia";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  url: string;
  title: string | null;
  isFeatured: boolean;
  includeInReport: boolean;
}

interface Props {
  eventId: string;
  eventTitle: string;
  media: MediaItem[];
  bannerMediaId?: string | null;
  posterMediaId?: string | null;
}

export default function EventMediaModeration({ eventId, eventTitle, media, bannerMediaId, posterMediaId }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mediaContext", JSON.stringify({ kind: "event", eventId, title: eventTitle }));
        formData.append("usage", "GALLERY");

        const res = await uploadMedia(formData);
        if (!res.success) {
          toast.error(`Failed to upload ${file.name}: ${res.error}`);
        } else {
          toast.success(`Uploaded ${file.name}`);
        }
      }
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleToggleFeature = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const res = await toggleMediaFeature(id, !currentStatus, eventId);
    if (res.error) toast.error(res.error);
    else toast.success(currentStatus ? "Removed from featured" : "Marked as featured");
    setLoadingId(null);
  };

  const handleToggleReportInclusion = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const res = await toggleMediaReportInclusion(id, !currentStatus, eventId);
    if (res.error) toast.error(res.error);
    else toast.success(currentStatus ? "Removed from report" : "Added to report");
    setLoadingId(null);
  };

  const handleSetRole = async (id: string, role: "banner" | "poster") => {
    setLoadingId(id);
    const res = await setEventMediaRole(id, eventId, role);
    if (res.error) toast.error(res.error);
    else toast.success(res.cleared ? `Removed as ${role}` : `Set as ${role} for the public event page`);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media? This cannot be undone.")) return;
    setLoadingId(id);
    const res = await deleteEventMedia(id, eventId);
    if (res.error) toast.error(res.error);
    else toast.success("Media deleted");
    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <p className="text-sm text-slate-500">Members can also add their own photos from the event page.</p>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button disabled={uploading} className="flex items-center gap-2 bg-brand hover:bg-brand-deep text-white">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((item) => {
          const isBanner = bannerMediaId === item.id;
          const isPoster = posterMediaId === item.id;
          return (
            <div key={item.id} className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${item.isFeatured ? 'border-amber-400 shadow-md' : 'border-slate-100'}`}>
              <Image src={item.url} alt={item.title || "Event Media"} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 rounded-full shadow-sm"
                      disabled={loadingId === item.id}
                    >
                      {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSetRole(item.id, "banner")}>
                      <ImageIcon className="w-4 h-4 mr-2" /> {isBanner ? "Remove as banner" : "Set as banner"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSetRole(item.id, "poster")}>
                      <FileImage className="w-4 h-4 mr-2" /> {isPoster ? "Remove as poster" : "Set as poster"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFeature(item.id, item.isFeatured)}>
                      <Star className={`w-4 h-4 mr-2 ${item.isFeatured ? "fill-current" : ""}`} />
                      {item.isFeatured ? "Remove from featured" : "Feature on website"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleReportInclusion(item.id, item.includeInReport)}>
                      <FileText className={`w-4 h-4 mr-2 ${item.includeInReport ? "fill-current" : ""}`} />
                      {item.includeInReport ? "Remove from report" : "Add to report"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-600 focus:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="absolute top-2 left-2 flex gap-1">
                {item.isFeatured && (
                  <div className="bg-amber-400 text-white p-1 rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-white" />
                  </div>
                )}
                {isBanner && (
                  <div className="bg-blue-500 text-white p-1 rounded-full shadow-sm">
                    <ImageIcon className="w-3 h-3" />
                  </div>
                )}
                {isPoster && (
                  <div className="bg-brand text-white p-1 rounded-full shadow-sm">
                    <FileImage className="w-3 h-3" />
                  </div>
                )}
                {item.includeInReport && (
                  <div className="bg-slate-700 text-white p-1 rounded-full shadow-sm">
                    <FileText className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {media.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-slate-200 rounded-2xl text-slate-500">
            No media uploaded by members yet.
          </div>
        )}
      </div>
    </div>
  );
}
