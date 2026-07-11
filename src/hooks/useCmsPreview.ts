"use client";

import { useEffect, useRef, useState } from "react";

interface CmsPreviewMessage<T> {
  type: "CMS_PREVIEW_UPDATE";
  channel: string;
  payload: T;
  /** DOM id of the section the editor is currently focused on; scrolled into view if present. */
  scrollTo?: string | null;
}

/**
 * Receives live edits from a CmsPreviewFrame in the parent admin editor via
 * postMessage, scoped by `channel` so unrelated editor/page pairs don't cross-talk.
 * Only listens when `enabled` (i.e. the page was loaded with ?preview=true).
 *
 * Also auto-scrolls to whichever section the editor reports as active (via
 * `scrollTo`, an element id on this page) so the preview follows the form.
 */
export function useCmsPreview<T>(
  initial: T,
  opts: { enabled: boolean; channel: string; merge?: (prev: T, payload: any) => T }
): T {
  const [data, setData] = useState(initial);
  const merge = opts.merge ?? ((prev: T, payload: any) => ({ ...prev, ...payload }));
  const lastScrollTo = useRef<string | null>(null);

  useEffect(() => {
    if (!opts.enabled) return;
    const handleMessage = (e: MessageEvent) => {
      const msg = e.data as CmsPreviewMessage<any>;
      if (msg && msg.type === "CMS_PREVIEW_UPDATE" && msg.channel === opts.channel) {
        setData((prev) => merge(prev, msg.payload));

        if (msg.scrollTo && msg.scrollTo !== lastScrollTo.current) {
          lastScrollTo.current = msg.scrollTo;
          const el = document.getElementById(msg.scrollTo);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled, opts.channel]);

  return data;
}
