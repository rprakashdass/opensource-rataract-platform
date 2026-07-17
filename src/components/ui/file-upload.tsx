import React, { useState, useRef } from 'react';
import { Button } from './button';
import { UploadCloud, File as FileIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMedia } from '@/features/media/actions/uploadMedia';
import { getMediaTypeFromExtension, ALLOWED_MEDIA_TYPES } from '@/lib/media-helpers';
import imageCompression from 'browser-image-compression';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  /** Album title this upload should be filed under (e.g. "Homepage", "About Page"), for Gallery management. */
  albumTitle?: string;
}

export function FileUpload({ value, onChange, accept, albumTitle }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      let uploadFile = file;
      const detectedType = getMediaTypeFromExtension(file.name);
      
      if (detectedType === 'IMAGE') {
        try {
          const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 2000,
            useWebWorker: true,
            fileType: 'image/webp'
          };
          uploadFile = await imageCompression(file, options);
          // rename the file extension to webp if it changed
          const newName = file.name.split('.').slice(0, -1).join('.') + '.webp';
          uploadFile = new File([uploadFile], newName, { type: 'image/webp' });
        } catch (error) {
          console.warn("Compression failed, uploading original:", error);
        }
      }

      formData.append("file", uploadFile);
      formData.append("title", uploadFile.name.split(".").slice(0, -1).join(".") || uploadFile.name);
      formData.append("type", detectedType);
      formData.append("usage", "WEBSITE");
      if (albumTitle) formData.append("albumTitle", albumTitle);
      
      const res = await uploadMedia(formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      onChange(res.media!.url);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const clearFile = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = value && getMediaTypeFromExtension(value) === "IMAGE";

  if (isUploading) {
    return (
      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center border-slate-300 bg-slate-50">
        <Loader2 className="h-8 w-8 text-brand mb-2 animate-spin" />
        <p className="text-sm font-medium text-slate-700">Uploading...</p>
      </div>
    );
  }

  if (value) {
    return (
      <div className="border rounded-md p-4 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3 overflow-hidden">
          {isImage ? (
            <img src={value} alt="Uploaded file" className="h-10 w-10 rounded object-cover flex-shrink-0" />
          ) : (
            <FileIcon className="h-6 w-6 text-brand flex-shrink-0" />
          )}
          <span className="text-sm truncate text-slate-700">{isImage ? "Image uploaded" : "Document Uploaded"}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={clearFile}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
        isDragging ? 'border-brand bg-slate-50' : 'border-slate-300 hover:bg-slate-50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
      <p className="text-sm font-medium text-slate-700">Click or drag file to upload</p>
      <p className="text-xs text-slate-500 mt-1">Accepts PDFs or Images</p>

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
