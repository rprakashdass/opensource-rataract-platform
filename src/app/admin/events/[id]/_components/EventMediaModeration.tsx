"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Trash2, Loader2, Play, Image as ImageIcon, FileImage } from "lucide-react";
import { toggleMediaFeature, deleteEventMedia, setEventMediaRole } from "@/features/events/actions/manageEventMedia";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  url: string;
  title: string | null;
  isFeatured: boolean;
  driveFileId: string | null;
}

interface Props {
  eventId: string;
  media: MediaItem[];
  driveFolderId: string | null;
  bannerMediaId?: string | null;
  posterMediaId?: string | null;
}

export default function EventMediaModeration({ eventId, media, driveFolderId, bannerMediaId, posterMediaId }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleFeature = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const res = await toggleMediaFeature(id, !currentStatus, eventId);
    if (res.error) toast.error(res.error);
    else toast.success(currentStatus ? "Removed from featured" : "Marked as featured");
    setLoadingId(null);
  };

  const handleSetRole = async (id: string, role: "banner" | "poster") => {
    setLoadingId(id);
    const res = await setEventMediaRole(id, eventId, role);
    if (res.error) toast.error(res.error);
    else toast.success(`Set as ${role} for the public event page`);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media? This will permanently remove it from Google Drive.")) return;
    setLoadingId(id);
    const res = await deleteEventMedia(id, eventId);
    if (res.error) toast.error(res.error);
    else toast.success("Media deleted");
    setLoadingId(null);
  };

  const driveLink = driveFolderId ? `https://drive.google.com/drive/folders/${driveFolderId}` : null;

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900">Google Drive Integration</h3>
          <p className="text-sm text-slate-500">Members upload directly to the shared Drive.</p>
        </div>
        {driveLink ? (
          <a href={driveLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Open Native Drive
            </Button>
          </a>
        ) : (
          <span className="text-sm text-slate-500 italic">No Drive folder configured</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((item) => {
          const isBanner = bannerMediaId === item.id;
          const isPoster = posterMediaId === item.id;
          return (
            <div key={item.id} className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${item.isFeatured ? 'border-amber-400 shadow-md' : 'border-slate-100'}`}>
              <Image src={item.url} alt={item.title || "Event Media"} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="w-8 h-8 rounded-full"
                    onClick={() => handleDelete(item.id)}
                    disabled={loadingId === item.id}
                  >
                    {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <Button
                      variant={isBanner ? "default" : "secondary"}
                      className={`flex-1 text-xs h-8 ${isBanner ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}`}
                      onClick={() => handleSetRole(item.id, "banner")}
                      disabled={loadingId === item.id || isBanner}
                    >
                      <ImageIcon className="w-3 h-3 mr-1" /> {isBanner ? "Banner" : "Set Banner"}
                    </Button>
                    <Button
                      variant={isPoster ? "default" : "secondary"}
                      className={`flex-1 text-xs h-8 ${isPoster ? "bg-purple-500 hover:bg-purple-600 text-white" : ""}`}
                      onClick={() => handleSetRole(item.id, "poster")}
                      disabled={loadingId === item.id || isPoster}
                    >
                      <FileImage className="w-3 h-3 mr-1" /> {isPoster ? "Poster" : "Set Poster"}
                    </Button>
                  </div>
                  <Button
                    variant={item.isFeatured ? "default" : "secondary"}
                    className={`w-full text-xs h-8 ${item.isFeatured ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                    onClick={() => handleToggleFeature(item.id, item.isFeatured)}
                    disabled={loadingId === item.id}
                  >
                    {loadingId === item.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Star className={`w-3 h-3 mr-1 ${item.isFeatured ? "fill-white" : ""}`} />}
                    {item.isFeatured ? "Featured" : "Feature"}
                  </Button>
                </div>
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
                  <div className="bg-purple-500 text-white p-1 rounded-full shadow-sm">
                    <FileImage className="w-3 h-3" />
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
