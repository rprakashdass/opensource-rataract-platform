import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import React from "react";

interface PublicHeroProps {
  badge: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function PublicHero({ 
  badge, 
  title, 
  description, 
  icon,
  children
}: PublicHeroProps) {
  return (
    <div className="bg-slate-50 text-slate-900 pt-32 pb-24 relative overflow-hidden border-b border-slate-200">
      <MaxWidthWrapper className="relative z-10">
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-white border border-slate-200 text-slate-700 shadow-sm mx-auto">
            {icon}
            {badge}
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
              {description}
            </p>
          )}
          {children && (
            <div className="pt-6 flex justify-center gap-4">
              {children}
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
