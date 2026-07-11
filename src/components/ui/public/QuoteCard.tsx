import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: string;
  authorName: string;
  authorRole?: string;
  avatarUrl?: string | null;
  colorTheme?: "peach" | "blue" | "green" | "lavender" | "slate";
}

const themeStyles = {
  peach: "bg-[#f5cbb5] text-[#0B132B]",
  blue: "bg-[#b5cce4] text-[#0B132B]",
  green: "bg-[#c6d1a5] text-[#0B132B]",
  lavender: "bg-[#dcbbf5] text-[#0B132B]",
  slate: "bg-slate-200 text-[#0B132B]",
};

export function QuoteCard({
  quote,
  authorName,
  authorRole,
  avatarUrl,
  colorTheme = "slate",
}: QuoteCardProps) {
  return (
    <div className={cn(
      "flex flex-col justify-between p-8 md:p-10 rounded-3xl h-full shadow-sm hover:shadow-md transition-shadow",
      themeStyles[colorTheme]
    )}>
      <blockquote className="text-lg md:text-xl font-medium leading-snug mb-12">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center gap-4 mt-auto">
        {avatarUrl ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/30">
            <Image 
              src={avatarUrl} 
              alt={authorName} 
              fill 
              sizes="40px"
              className="object-cover" 
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full shrink-0 border-2 border-white/30 flex items-center justify-center font-black bg-white/20">
            {authorName.charAt(0)}
          </div>
        )}
        
        <div>
          <p className="font-black text-sm">{authorName}</p>
          {authorRole && (
            <p className="text-xs font-semibold opacity-75">{authorRole}</p>
          )}
        </div>
      </div>
    </div>
  );
}
