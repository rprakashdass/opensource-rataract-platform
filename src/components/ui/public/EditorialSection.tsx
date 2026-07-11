import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import React from "react";
import { cn } from "@/lib/utils";

interface EditorialSectionProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  background?: "white" | "slate" | "navy";
}

export function EditorialSection({ 
  eyebrow,
  heading, 
  description, 
  children,
  className,
  background = "white"
}: EditorialSectionProps) {
  return (
    <section className={cn(
      "py-24 md:py-32",
      background === "slate" && "bg-[#FAF9F6] border-y border-slate-200/50",
      background === "navy" && "bg-[#0B132B] text-white",
      background === "white" && "bg-white",
      className
    )}>
      <MaxWidthWrapper>
        {(eyebrow || heading || description) && (
          <div className="mb-16 md:mb-20 max-w-4xl space-y-6">
            {eyebrow && (
              <div className="flex items-center gap-3">
                <span className={cn(
                  "h-px w-8",
                  background === "navy" ? "bg-[#F7A800]" : "bg-primary"
                )} />
                <span className={cn(
                  "font-black text-xs uppercase tracking-[0.25em]",
                  background === "navy" ? "text-[#F7A800]" : "text-primary"
                )}>
                  {eyebrow}
                </span>
              </div>
            )}
            
            {heading && (
              <h2 className={cn(
                "text-4xl md:text-5xl font-black tracking-tight leading-[1.1]",
                background === "navy" ? "text-white" : "text-[#0B132B]"
              )}>
                {heading}
              </h2>
            )}
            
            {description && (
              <p className={cn(
                "text-lg font-medium leading-relaxed max-w-2xl",
                background === "navy" ? "text-white/60" : "text-slate-500"
              )}>
                {description}
              </p>
            )}
          </div>
        )}
        
        {children}
        
      </MaxWidthWrapper>
    </section>
  );
}
