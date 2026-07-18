"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { disconnectGoogleDrive } from "@/features/storage/actions/disconnectGoogleDrive";
import { HardDrive, LogOut, ExternalLink, AlertCircle } from "lucide-react";

export default function DriveClientControls({ isConnected, rootFolderId }: { isConnected: boolean, rootFolderId: string | null }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    window.location.href = "/api/google/auth";
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Drive? Media uploads will fail until reconnected.")) return;
    
    setLoading(true);
    const res = await disconnectGoogleDrive();
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Google Drive disconnected successfully");
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-200">
      {!isConnected ? (
        <Button onClick={handleConnect} disabled={loading} className="bg-brand text-white hover:bg-brand-deep rounded-full px-6">
          <HardDrive className="w-4 h-4 mr-2" /> Connect Google Drive
        </Button>
      ) : (
        <>
          {rootFolderId && (
            <Button variant="outline" asChild className="rounded-full">
              <a href={`https://drive.google.com/drive/folders/${rootFolderId}`} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Open Drive Folder
              </a>
            </Button>
          )}
          <Button variant="outline" onClick={handleConnect} disabled={loading} className="rounded-full text-slate-700">
            Reconnect Account
          </Button>
          <Button variant="ghost" onClick={handleDisconnect} disabled={loading} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full">
            <LogOut className="w-4 h-4 mr-2" /> Disconnect
          </Button>
        </>
      )}
    </div>
  );
}
