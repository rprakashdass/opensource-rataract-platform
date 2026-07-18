"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { UploadCloud, File as FileIcon, X, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { uploadMedia } from '@/features/media/actions/uploadMedia';
import { updateMediaTitle } from '@/features/media/actions/updateMediaTitle';
import { Input } from './input';
import { MediaType, MediaUsage } from '@prisma/client';
import { ALLOWED_MEDIA_TYPES, getMediaTypeFromExtension } from '@/lib/media-helpers';
import imageCompression from 'browser-image-compression';
import { MediaContext } from '@/features/media/lib/resolveAlbum';

export type UploadStatus = "idle" | "uploading" | "done" | "error";

interface FileUploadProps {
  value?: string;
  onChange: (value: string, mediaObj?: any) => void;
  type?: MediaType;
  usage?: MediaUsage;
  accept?: string;
  isCover?: boolean;
  context: MediaContext;
  returnType?: "id" | "url";
  onStatusChange?: (status: UploadStatus) => void;
}

export function FileUpload({ 
  value, 
  onChange, 
  type, 
  usage, 
  accept, 
  isCover = false, 
  context, 
  returnType = "url",
  onStatusChange 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<UploadStatus>(value ? "done" : "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mediaId, setMediaId] = useState<string | null>(null); // To store the uploaded media ID for title updates
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const defaultAccept = type === "IMAGE"
    ? ALLOWED_MEDIA_TYPES.image
    : type === "DOCUMENT"
      ? ALLOWED_MEDIA_TYPES.document
      : ALLOWED_MEDIA_TYPES.any;
  const finalAccept = accept || defaultAccept;

  const doUpload = async (uploadFile: File, uploadTitle: string) => {
    setStatus("uploading");
    setErrorMsg("");
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      let finalFile = uploadFile;
      const detectedType = type || getMediaTypeFromExtension(uploadFile.name);
      
      if (detectedType === 'IMAGE') {
        try {
          finalFile = await imageCompression(uploadFile, { maxSizeMB: 10, maxWidthOrHeight: 2000, useWebWorker: true, fileType: 'image/webp' });
          finalFile = new File([finalFile], uploadFile.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
        } catch { /* use original */ }
      }

      const formData = new FormData();
      formData.append("file", finalFile);
      formData.append("title", uploadTitle.trim());
      formData.append("type", detectedType);
      
      let finalUsage = usage || "GALLERY";
      if (!usage) {
        if (context.kind === "website") finalUsage = "WEBSITE";
        if (context.kind === "members") finalUsage = "GALLERY";
      }
      formData.append("usage", finalUsage);
      formData.append("isCover", isCover.toString());
      formData.append("mediaContext", JSON.stringify(context));

      const result = await uploadMedia(formData);
      
      if (signal.aborted) return; // Discard if cancelled

      if (result.success && result.media) {
        setMediaId(result.media.id);
        const outValue = returnType === "id" ? result.media.id : result.media.url;
        // MUST call onChange BEFORE setting status to done to avoid race condition where form submits without value
        onChange(outValue, result.media);
        setStatus("done");
      } else {
        setStatus("error");
        setErrorMsg(result.error || "Upload failed");
      }
    } catch (err: any) {
      if (signal.aborted) return;
      setStatus("error");
      setErrorMsg(err.message || "Failed to upload file");
    }
  };

  const pickFile = (picked: File) => {
    setFile(picked);
    const defaultTitle = picked.name.replace(/\.[^.]+$/, '') || picked.name;
    setTitle(defaultTitle);
    doUpload(picked, defaultTitle);
  };

  const cancelUpload = () => {
    abortControllerRef.current?.abort();
    onChange('');
    setFile(null);
    setTitle('');
    setStatus("idle");
    setMediaId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTitleBlur = async () => {
    if (status === "done" && mediaId && title.trim()) {
      setIsUpdatingTitle(true);
      await updateMediaTitle(mediaId, title.trim());
      setIsUpdatingTitle(false);
    }
  };

  // ── Error State ────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="border rounded-md p-3 flex flex-col gap-2 bg-rose-50 border-rose-200">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 text-sm text-rose-800 truncate">
            <X className="h-5 w-5 shrink-0" />
            <span className="truncate">{errorMsg || "Upload failed"}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-800 hover:bg-rose-100" onClick={cancelUpload}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex justify-end mt-1">
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs bg-white text-rose-700 border-rose-200 hover:bg-rose-100"
            onClick={() => file && doUpload(file, title)}
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  // ── Uploading or Done State ────────────────────────────────────────────────
  if (status === "uploading" || status === "done" || value) {
    const isImage = value && getMediaTypeFromExtension(value) === "IMAGE";
    
    return (
      <div className={`border rounded-md p-3 space-y-2 ${status === "done" ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
        {/* Header row with icon, title input, and cancel */}
        <div className="flex items-center gap-2 min-w-0">
          {status === "done" ? (
             <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
             <Loader2 className="h-5 w-5 text-brand shrink-0 animate-spin" />
          )}
          
          <Input
            className={`h-8 text-sm flex-1 ${status === "done" ? "bg-transparent border-transparent hover:border-slate-300 focus:border-brand focus:bg-white" : ""}`}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Media title"
            disabled={status === "uploading"}
          />
          
          {isUpdatingTitle && <Loader2 className="h-3 w-3 animate-spin text-slate-400 shrink-0" />}

          <button
            type="button"
            className="ml-auto shrink-0 text-slate-400 hover:text-slate-700"
            onClick={cancelUpload}
            title={status === "uploading" ? "Cancel Upload" : "Remove Media"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Filename and progress label */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pl-7">
          <span className="truncate">{file?.name || (isImage ? "Image" : "Document")}</span>
          {status === "uploading" && <span>(Uploading...)</span>}
        </div>
      </div>
    );
  }

  // ── Drop zone (Idle State) ─────────────────────────────────────────────────
  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
        isDragging ? 'border-brand bg-slate-50' : 'border-slate-300 hover:bg-slate-50'
      }`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) pickFile(f);
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
      <p className="text-sm font-medium text-slate-700">Click or drag file to upload</p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
        className="hidden"
        accept={finalAccept}
      />
    </div>
  );
}
