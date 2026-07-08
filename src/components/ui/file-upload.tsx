import React, { useState, useRef } from 'react';
import { Button } from './button';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
}

export function FileUpload({ value, onChange, accept }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (value) {
    return (
      <div className="border rounded-md p-4 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
          <span className="text-sm truncate text-slate-700">Document Uploaded</span>
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
        isDragging ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:bg-slate-50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) onChange(event.target.result as string);
          };
          reader.readAsDataURL(file);
        }
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
