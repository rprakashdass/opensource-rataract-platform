"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, ExternalLink, Loader2, Upload } from "lucide-react";
import { uploadMedia } from "@/features/media/actions/uploadMedia";
import { toast } from "sonner";

export default function EventMemories({ eventId, eventTitle, driveFolderId }: { eventId: string; eventTitle: string; driveFolderId?: string | null }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      // Upload one by one for simplicity, or handle multiple.
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("context", JSON.stringify({ kind: "event", eventId, title: eventTitle }));
        formData.append("usage", "GALLERY");
        
        const res = await uploadMedia(formData);
        if (!res.success) {
          toast.error(`Failed to upload ${file.name}: ${res.error}`);
        } else {
          toast.success(`Uploaded ${file.name}`);
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const driveLink = driveFolderId ? `https://drive.google.com/drive/folders/${driveFolderId}` : null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mt-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-amber-500" /> Event Memories
      </h2>
      
      {driveFolderId ? (
        <div className="space-y-6">
          <p className="text-sm text-slate-500">
            Share your photos from the event! They will be uploaded directly to our club's shared Google Drive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <Button disabled={uploading} className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Select Photos"}
              </Button>
            </div>
            
            <a href={driveLink!} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" /> Open Drive Folder
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl">
          Google Drive storage is not configured for this event yet.
        </div>
      )}
    </div>
  );
}
