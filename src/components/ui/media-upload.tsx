"use client";

import React, { useState, useRef } from 'react';
import { Button } from './button';
import { UploadCloud, File as FileIcon, X, CheckCircle2, Loader2 } from 'lucide-react';
import { uploadMedia } from '@/features/media/actions/uploadMedia';
import { Input } from './input';
import { Label } from './label';
import { MediaType, MediaUsage } from '@prisma/client';

interface MediaUploadProps {
  value?: string; // This will be the Media ID now
  onChange: (mediaId: string) => void;
  type?: MediaType;
  usage?: MediaUsage;
  accept?: string;
  isCover?: boolean;
  albumId?: string | null;
}

export function MediaUpload({ value, onChange, type = "IMAGE", usage = "GALLERY", accept = "image/*", isCover = false, albumId }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      // Default title to file name without extension
      setTitle(selected.name.split('.').slice(0, -1).join('.'));
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);
    formData.append("usage", usage);
    formData.append("isCover", isCover.toString());
    if (albumId) formData.append("albumId", albumId);

    const result = await uploadMedia(formData);
    
    setIsUploading(false);
    if (result.success && result.media) {
      // Pass back the media ID
      onChange(result.media.id);
      setFile(null);
    } else {
      alert(result.error || "Failed to upload");
    }
  };

  const clearFile = () => {
    onChange('');
    setFile(null);
    setTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (value) {
    return (
      <div className="border rounded-md p-4 flex items-center justify-between bg-slate-50 border-green-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
          <span className="text-sm truncate text-slate-700">Media Uploaded Successfully</span>
        </div>
        <Button variant="ghost" size="icon" onClick={clearFile}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (file) {
    return (
      <div className="border border-slate-200 rounded-md p-4 space-y-4 bg-slate-50">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <FileIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isUploading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Cover Image"
            disabled={isUploading}
          />
        </div>
        <Button 
          type="button" 
          onClick={handleUpload} 
          disabled={!title || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading to Supabase...
            </>
          ) : (
            "Save Media"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
        isDragging ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:bg-slate-50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
          setFile(droppedFile);
          setTitle(droppedFile.name.split('.').slice(0, -1).join('.'));
        }
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
      <p className="text-sm font-medium text-slate-700">Click or drag file to upload</p>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />
    </div>
  );
}
