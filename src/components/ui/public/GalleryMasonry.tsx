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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[600px]">
      {/* Main Large Photo */}
      {photos[0] && (
        <div className="md:col-span-8 md:row-span-2 relative h-[400px] md:h-full rounded-3xl overflow-hidden group shadow-2xl">
          <Image 
            src={getGoogleDriveDirectLink(photos[0].url)} 
            alt={photos[0].title || "Highlight memory"}
            fill 
            sizes="(max-width: 768px) 100vw, 66vw" 
            className="object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          {/* Title overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 pointer-events-none">
            {photos[0].title && (
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-end gap-4">
                  <span className="h-8 w-1 bg-[#F7A800] shrink-0 mb-0.5" />
                  <div>
                    <p className="text-[#F7A800] text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Gallery</p>
                    <p className="text-white font-black text-2xl leading-tight">{photos[0].title}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Side Photos */}
      <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 h-[200px] md:h-full">
        {photos.slice(1, 3).map((photo) => (
          <div key={photo.id} className="relative h-full rounded-3xl overflow-hidden group shadow-xl">
            <Image 
              src={getGoogleDriveDirectLink(photo.url)} 
              alt={photo.title || "Club memory"}
              fill 
              sizes="(max-width: 768px) 50vw, 33vw" 
              className="object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            {/* Title overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 pointer-events-none">
              {photo.title && (
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[#F7A800] text-[9px] font-black uppercase tracking-[0.2em] mb-1">Gallery</p>
                  <p className="text-white font-black text-sm leading-tight line-clamp-2">{photo.title}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
