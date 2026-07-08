import React, { useState } from 'react';
import { Button } from './button';
import { Bold, Italic, List, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [focused, setFocused] = useState(false);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    // In a real implementation this would insert at cursor
    onChange(value + prefix + suffix);
  };

  return (
    <div className={cn("border rounded-md overflow-hidden bg-white", focused ? "ring-2 ring-ring" : "", className)}>
      <div className="flex items-center border-b px-2 py-1 bg-slate-50 gap-1">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting('**', '**')}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting('*', '*')}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting('- ')}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting('[Link Text](url)')}>
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full min-h-[150px] p-3 focus:outline-none resize-y"
      />
    </div>
  );
}
