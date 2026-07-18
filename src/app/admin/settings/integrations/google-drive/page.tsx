import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import DriveClientControls from "./_components/DriveClientControls";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default async function GoogleDriveSettingsPage({ searchParams }: { searchParams: { error?: string, success?: string } }) {
  const club = await getCurrentClub();
  if (!club) notFound();

  const clubData = await prisma.club.findUnique({ where: { id: club.id } });
  if (!clubData) notFound();

  const isConnected = !!clubData.googleDriveRefreshToken;
  const connectedAt = clubData.googleDriveConnectedAt;
  const connectedEmail = clubData.googleDriveEmail;
  const rootFolderId = clubData.googleDriveRootFolderId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Google Drive Integration"
        description="Connect your club's Google Drive to automatically store media and documents."
      />

      {searchParams.error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-200 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Connection Failed</p>
            <p className="mt-1">{searchParams.error === "no_refresh_token" ? "Google did not provide a refresh token. Please go to your Google Account security settings, revoke access for this app, and try connecting again." : "An error occurred while connecting to Google Drive."}</p>
          </div>
        </div>
      )}

      {searchParams.success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-start gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Successfully Connected</p>
            <p className="mt-1">Your Google Drive account is now linked and the root folders have been provisioned.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 15h-2v-2h2v2zm0-4h-2V7h2v7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Google Drive Status</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <span className="text-sm font-medium text-slate-600">{isConnected ? 'Connected & Active' : 'Not Connected'}</span>
            </div>
          </div>
        </div>

        {isConnected ? (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 text-sm">
            <div>
              <dt className="text-slate-500 font-medium mb-1">Connected Account</dt>
              <dd className="font-semibold text-slate-900">{connectedEmail || "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium mb-1">Connected Since</dt>
              <dd className="font-semibold text-slate-900">{connectedAt ? format(new Date(connectedAt), "MMM d, yyyy 'at' h:mm a") : "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium mb-1">Root Folder ID</dt>
              <dd className="font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded truncate max-w-xs">{rootFolderId || "Pending creation"}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 space-y-4">
            <p>Connect your Google Drive to permanently store all photos, documents, and assets uploaded to your Rotaract platform.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Automatic folder creation for every Event and Project.</li>
              <li>Securely stores a refresh token—you only need to log in once.</li>
              <li>Disconnect at any time without losing your existing files.</li>
            </ul>
          </div>
        )}

        <DriveClientControls isConnected={isConnected} rootFolderId={rootFolderId} />
      </div>
    </div>
  );
}
