import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface PublicCardProps {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  badge?: string;
  badgeColor?: "default" | "success" | "warning";
  meta?: React.ReactNode;
  footer?: React.ReactNode;
}

export function PublicCard({
  title,
  description,
  imageUrl,
  href,
  badge,
  badgeColor = "default",
  meta,
  footer
}: PublicCardProps) {
  return (
    <Link 
      href={href} 
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {badge && (
          <div className="absolute top-4 left-4">
            <Badge className={`
              shadow-sm border-none backdrop-blur-sm
              ${badgeColor === "default" ? "bg-white/90 text-slate-900" : ""}
              ${badgeColor === "success" ? "bg-emerald-500/90 text-white" : ""}
              ${badgeColor === "warning" ? "bg-amber-500/90 text-white" : ""}
            `}>
              {badge}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        {meta && (
          <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
            {meta}
          </div>
        )}
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">{description}</p>
        
        {footer ? (
          <div className="pt-4 border-t border-slate-50 mt-auto text-sm">
            {footer}
          </div>
        ) : (
          <div className="flex justify-end text-sm text-slate-400 font-bold mt-auto group-hover:text-primary transition-colors">
            Read More <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </Link>
  );
}
