"use client";

import React from "react";
import Image from "next/image";

import { getGoogleDriveDirectLink } from "@/lib/utils";

interface GalleryMasonryProps {
  photos: { id: string; url: string; title: string | null }[];
}

export function GalleryMasonry({ photos }: GalleryMasonryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-6 justify-center w-full">
      {photos.map((photo) => (
        <div 
          key={photo.id} 
          className="flex-1 min-w-[280px] max-w-[385px] h-[280px] relative rounded-3xl overflow-hidden group shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-white/10"
        >
          <Image 
            src={getGoogleDriveDirectLink(photo.url)} 
            alt={photo.title || "Club memory"}
            fill 
            sizes="(max-width: 768px) 100vw, 33vw" 
            className="object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          {/* Title overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none flex flex-col justify-end p-6">
            <p className="text-[#F7A800] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Gallery</p>
            {photo.title && (
              <p className="text-white font-black text-lg leading-tight">{photo.title}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
