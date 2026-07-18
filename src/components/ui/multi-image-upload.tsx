"use client";

import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, Loader2, X, RotateCcw } from "lucide-react";
import { MediaContext } from "@/features/media/lib/resolveAlbum";
import { uploadOneFile } from "@/lib/uploadOneFile";

type RowStatus = "uploading" | "done" | "error";

interface Row {
  key: string;
  file: File;
  status: RowStatus;
  error?: string;
}

interface MultiImageUploadProps {
  context: MediaContext;
  /** Called after each file finishes uploading successfully. */
  onUploaded?: (mediaId: string) => void;
  /** Called once the whole batch (all files) has settled. */
  onBatchComplete?: () => void;
  accept?: string;
}

/**
 * Drop or select several photos at once; each uploads independently with its
 * own progress row, so one slow/failed file never blocks the rest.
 */
export function MultiImageUpload({ context, onUploaded, onBatchComplete, accept = "image/*" }: MultiImageUploadProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingCountRef = useRef(0);

  const uploadFile = async (row: Row) => {
    const result = await uploadOneFile(row.file, context);
    setRows((prev) =>
      prev.map((r) =>
        r.key === row.key
          ? result.success && result.media
            ? { ...r, status: "done" }
            : { ...r, status: "error", error: result.error || "Upload failed" }
          : r
      )
    );
    if (result.success && result.media) onUploaded?.(result.media.id);

    pendingCountRef.current -= 1;
    if (pendingCountRef.current === 0) onBatchComplete?.();
  };

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const newRows: Row[] = list.map((file) => ({
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "uploading",
    }));

    pendingCountRef.current += newRows.length;
    setRows((prev) => [...prev, ...newRows]);
    newRows.forEach((row) => uploadFile(row));
  };

  const retryRow = (row: Row) => {
    setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, status: "uploading", error: undefined } : r)));
    pendingCountRef.current += 1;
    uploadFile(row);
  };

  const dismissRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
          isDragging ? "border-brand bg-slate-50" : "border-slate-300 hover:bg-slate-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700">Click or drag photos to upload</p>
        <p className="text-xs text-slate-400 mt-1">You can select multiple at once</p>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
          accept={accept}
        />
      </div>

      {rows.length > 0 && (
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div
              key={row.key}
              className={`flex items-center gap-2 border rounded-md px-3 py-2 text-sm ${
                row.status === "error"
                  ? "bg-rose-50 border-rose-200"
                  : row.status === "done"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {row.status === "uploading" && <Loader2 className="h-4 w-4 text-brand shrink-0 animate-spin" />}
              {row.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
              {row.status === "error" && <X className="h-4 w-4 text-rose-600 shrink-0" />}

              <span className="truncate flex-1">
                {row.status === "error" ? row.error || "Upload failed" : row.file.name}
              </span>

              {row.status === "error" && (
                <button
                  type="button"
                  onClick={() => retryRow(row)}
                  className="shrink-0 text-xs font-medium text-rose-700 hover:text-rose-900 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissRow(row.key)}
                className="shrink-0 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
