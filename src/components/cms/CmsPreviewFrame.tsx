"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Eye } from "lucide-react";

export interface CmsPreviewFrameHandle {
  /** Hard-reload the iframe from the server (call after a successful save). */
  reload: () => void;
}

interface CmsPreviewFrameProps {
  /** The public route to preview, e.g. "/?preview=true" or "/about?preview=true". */
  previewUrl: string;
  /** Scopes postMessage traffic to the matching useCmsPreview() call on the public page. */
  channel: string;
  /** Whatever data the public page's useCmsPreview() should merge in on change. */
  payload: any;
  /** DOM id (on the public page) of the section currently being edited; scrolled into view. */
  scrollTo?: string | null;
}

const CmsPreviewFrame = forwardRef<CmsPreviewFrameHandle, CmsPreviewFrameProps>(
  ({ previewUrl, channel, payload, scrollTo }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const postUpdate = () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "CMS_PREVIEW_UPDATE", channel, payload, scrollTo },
        "*"
      );
    };

    // Re-post on every payload or active-section change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      postUpdate();
    }, [JSON.stringify(payload), channel, scrollTo]);

    useImperativeHandle(ref, () => ({
      reload: () => {
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      },
    }));

    return (
      <div className="lg:col-span-7 h-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/60 relative flex flex-col shadow-inner">
        {/* Frame address bar simulation */}
        <div className="bg-slate-200/70 px-4 py-3 border-b border-slate-200 flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <div className="flex-1 bg-white/70 rounded-lg px-3 py-1 text-slate-500 font-mono text-[10px] truncate flex items-center justify-between select-none">
            <span>https://localhost:3000{previewUrl}</span>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 w-full bg-white relative">
          <iframe
            ref={iframeRef}
            src={previewUrl}
            onLoad={postUpdate}
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    );
  }
);

CmsPreviewFrame.displayName = "CmsPreviewFrame";

export default CmsPreviewFrame;
