"use client";

import React, { useState, useRef } from 'react';
import { Button } from './button';
import { UploadCloud, FileText, FileImage, File as FileIcon, X, CheckCircle2, Loader2, Eye, Pencil } from 'lucide-react';
import { uploadDocument } from '@/features/documents/actions/uploadDocument';
import { DocumentType } from '@prisma/client';

interface DocumentUploadProps {
  value?: string;
  onChange: (urlOrId: string) => void;
  type: DocumentType;
  accept?: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  label?: string;
  title?: string;
  onTitleChange?: (title: string) => void;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return <FileImage className="h-8 w-8 text-blue-500" />;
  if (['pdf'].includes(ext || '')) return <FileText className="h-8 w-8 text-red-500" />;
  return <FileIcon className="h-8 w-8 text-slate-500" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileLabel(url: string) {
  try {
    const parts = new URL(url).pathname.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return 'Uploaded file';
  }
}

export function DocumentUpload({
  value,
  onChange,
  type,
  accept,
  linkedEntityType,
  linkedEntityId,
  label,
  title: titleProp,
  onTitleChange,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadInternal = async (selectedFile: File) => {
    setError(null);
    setIsUploading(true);
    setProgress(10);

    // Fake progress ticks while uploading
    const ticker = setInterval(() => {
      setProgress(p => Math.min(p + 12, 85));
    }, 400);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("displayName", selectedFile.name.split('.').slice(0, -1).join('.'));
    formData.append("type", type);
    if (linkedEntityType) formData.append("linkedEntityType", linkedEntityType);
    if (linkedEntityId) formData.append("linkedEntityId", linkedEntityId);

    const result = await uploadDocument(formData);
    clearInterval(ticker);
    setIsUploading(false);

    if (result.success && result.document) {
      setProgress(100);
      onChange(result.document.fileUrl);
    } else {
      setProgress(0);
      setFile(null);
      setError(result.error || "Upload failed. Please try again.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      await handleUploadInternal(selected);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      await handleUploadInternal(dropped);
    }
  };

  const clearFile = () => {
    onChange('');
    setFile(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Uploaded state ───────────────────────────────────────────────────────
  if (value && !isUploading) {
    const rawFileName = getFileLabel(value);
    const ext = rawFileName.split('.').pop()?.toLowerCase();
    const isPdf = ext === 'pdf';

    return <UploadedFile
      value={value}
      rawFileName={rawFileName}
      isPdf={isPdf}
      titleProp={titleProp}
      onTitleChange={onTitleChange}
      onClear={clearFile}
      onReplace={() => fileInputRef.current?.click()}
      fileInputRef={fileInputRef}
      accept={accept}
      onFileChange={handleFileChange}
    />;
  }



  // ─── Uploading state ──────────────────────────────────────────────────────
  if (isUploading && file) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
            {getFileIcon(file.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
          </div>
          <Loader2 className="h-5 w-5 text-purple-500 animate-spin flex-shrink-0" />
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 text-center">Uploading to storage… {progress}%</p>
      </div>
    );
  }

  // ─── Drop zone ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <X className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group ${
          isDragging
            ? 'border-purple-500 bg-purple-50 scale-[1.01]'
            : 'border-slate-200 bg-slate-50 hover:border-purple-400 hover:bg-purple-50/40'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
          isDragging ? 'bg-purple-100' : 'bg-white border border-slate-200 group-hover:border-purple-200 group-hover:bg-purple-50'
        }`}>
          <UploadCloud className={`h-6 w-6 transition-colors ${isDragging ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-500'}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 group-hover:text-purple-700 transition-colors">
            {isDragging ? 'Drop file here' : `Upload ${label || 'Document'}`}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX • Max 10 MB</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={accept}
        />
      </div>
    </div>
  );
}

// ─── Uploaded file sub-component (with inline title editing) ─────────────────
function UploadedFile({
  value,
  rawFileName,
  isPdf,
  titleProp,
  onTitleChange,
  onClear,
  onReplace,
  fileInputRef,
  accept,
  onFileChange,
}: {
  value: string;
  rawFileName: string;
  isPdf: boolean;
  titleProp?: string;
  onTitleChange?: (t: string) => void;
  onClear: () => void;
  onReplace: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  accept?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const displayName = titleProp || rawFileName;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(displayName);
    setEditing(true);
    setTimeout(() => { inputRef.current?.select(); }, 0);
  };

  const confirm = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== displayName) {
      onTitleChange?.(trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(displayName);
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-green-100 flex items-center justify-center shadow-sm">
          {getFileIcon(rawFileName)}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={confirm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); confirm(); }
                if (e.key === 'Escape') cancel();
              }}
              className="w-full text-sm font-semibold text-slate-800 bg-white border border-brand rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-brand"
            />
          ) : (
            <button
              type="button"
              onClick={startEdit}
              title="Click to rename"
              className="group flex items-center gap-1.5 max-w-full text-left"
            >
              <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand transition-colors">
                {displayName}
              </span>
              <Pencil className="h-3 w-3 text-slate-400 group-hover:text-brand flex-shrink-0 transition-colors" />
            </button>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Uploaded
            </span>
            {!editing && (
              <span className="text-[10px] text-slate-400">click name to rename</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isPdf && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700"
              onClick={() => window.open(value, '_blank')}
              title="Preview PDF"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-500"
            onClick={onClear}
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Change file strip */}
      <div
        className="px-3 py-2 bg-white border-t border-green-100 flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onReplace}
      >
        <UploadCloud className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs text-slate-500">Click to replace file</span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept={accept}
        />
      </div>
    </div>
  );
}
