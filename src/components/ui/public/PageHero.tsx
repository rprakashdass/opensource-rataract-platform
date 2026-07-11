import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import React from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  backgroundImage?: string;
  align?: "left" | "center";
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  backgroundImage,
  align = "center",
}: PageHeroProps) {
  return (
    <div className="relative min-h-[56vh] flex flex-col justify-end bg-[#FAF9F6] overflow-hidden pt-32 pb-24">
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-[0.03] bg-cover bg-center pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      <MaxWidthWrapper className="relative z-10 flex flex-col h-full justify-center">
        <div 
          className={cn(
            "max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8",
            align === "center" ? "mx-auto text-center flex flex-col items-center" : ""
          )}
        >
          {eyebrow && (
            <div className={cn(
              "flex items-center gap-3",
              align === "center" ? "justify-center" : ""
            )}>
              <span className="h-px w-8 bg-[#F7A800]" />
              <span className="text-[#F7A800] font-black text-xs uppercase tracking-[0.25em]">{eyebrow}</span>
              {align === "center" && <span className="h-px w-8 bg-[#F7A800]" />}
            </div>
          )}
          
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-medium text-[#0B132B] leading-[1.05] tracking-tight">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
          
          {children && (
            <div className={cn(
              "pt-6 flex flex-wrap gap-4",
              align === "center" ? "justify-center" : ""
            )}>
              {children}
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
