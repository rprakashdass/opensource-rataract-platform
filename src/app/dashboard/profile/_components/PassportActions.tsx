"use client";

import { useState } from "react";
import { Download, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PASSPORT_URL = "/dashboard/profile/passport";

/**
 * Download / Share the member's passport card (rendered server-side as a PNG at
 * /dashboard/profile/passport). Share uses the native share sheet where the
 * browser supports sharing files (mobile), and falls back to a download.
 */
export default function PassportActions({ name }: { name: string }) {
  const [busy, setBusy] = useState<null | "download" | "share">(null);
  const fileName = `${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-passport.png`;

  const fetchBlob = async () => {
    const res = await fetch(PASSPORT_URL);
    if (!res.ok) throw new Error("Could not render passport");
    return res.blob();
  };

  const handleDownload = async () => {
    if (busy) return;
    setBusy("download");
    try {
      const blob = await fetchBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't download your card. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    if (busy) return;
    setBusy("share");
    try {
      const blob = await fetchBlob();
      const file = new File([blob], fileName, { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: `${name} · Rotaract Passport`,
          text: "My Rotaract membership passport",
        });
      } else {
        // Desktop / unsupported: fall back to download.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("Card saved — sharing isn't supported here, so we downloaded it instead.");
      }
    } catch (err) {
      // AbortError = user dismissed the share sheet; stay quiet.
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Couldn't share your card. Please try again.");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button
        onClick={handleDownload}
        disabled={!!busy}
        className="motion-button inline-flex items-center justify-center gap-2 rounded-xl border border-hairline py-2.5 text-xs font-bold text-ink-soft bg-white hover:border-brand hover:text-brand transition-colors disabled:opacity-60"
      >
        {busy === "download" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        Download Card
      </button>
      <button
        onClick={handleShare}
        disabled={!!busy}
        className="motion-button inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-xs font-bold text-white hover:bg-brand-deep transition-colors disabled:opacity-60"
      >
        {busy === "share" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
        Share Passport
      </button>
    </div>
  );
}
