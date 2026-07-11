import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface StoryCardProps {
  title: string;
  imageUrl: string;
  href: string;
  eyebrow?: string;
  meta?: string;
}

export function StoryCard({
  title,
  imageUrl,
  href,
  eyebrow,
  meta,
}: StoryCardProps) {
  return (
    <Link 
      href={href} 
      className="group flex flex-col block w-full"
    >
      <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden rounded-2xl mb-6 shadow-sm group-hover:shadow-md transition-all duration-500">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="flex flex-col flex-1 px-1">
        {eyebrow && (
          <div className="text-[10px] font-black text-primary mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-4 h-px bg-primary" />
            {eyebrow}
          </div>
        )}
        <h3 className="text-xl md:text-2xl font-black text-[#0B132B] mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        {meta && (
          <p className="text-slate-500 text-xs font-bold mb-5 flex-1">
            {meta}
          </p>
        )}
        
        <div className="flex items-center text-xs font-black text-[#0B132B] uppercase tracking-widest mt-auto group-hover:translate-x-1 group-hover:text-primary transition-all">
          Read Story <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </div>
      </div>
    </Link>
  );
}
