"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { MediaContext } from "@/features/media/lib/resolveAlbum";

interface Props {
  value: string[];
  onChange: (attachments: string[]) => void;
  context: MediaContext;
  onStatusChange?: (status: "idle" | "uploading" | "done" | "error") => void;
  returnType?: "id" | "url";
}

export function AttachmentsField({ value, onChange, context, onStatusChange, returnType }: Props) {
  const addSlot = () => onChange([...value, ""]);
  const removeSlot = (index: number) => onChange(value.filter((_, i) => i !== index));
  const updateSlot = (index: number, val: string) => {
    const next = [...value];
    next[index] = val;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((url, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            <FileUpload value={url} onChange={(u) => updateSlot(index, u)} context={context} onStatusChange={onStatusChange} returnType={returnType} />
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => removeSlot(index)}>
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addSlot}>
        <Plus className="w-4 h-4 mr-2" /> Add Attachment
      </Button>
    </div>
  );
}
