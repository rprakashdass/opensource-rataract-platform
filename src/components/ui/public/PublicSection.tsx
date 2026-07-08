import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import React from "react";
import { cn } from "@/lib/utils";

interface PublicSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  background?: "white" | "slate";
}

export function PublicSection({ 
  title, 
  description, 
  children,
  className,
  background = "white"
}: PublicSectionProps) {
  return (
    <section className={cn(
      "py-16 md:py-24",
      background === "slate" ? "bg-slate-50 border-y border-slate-100" : "bg-white",
      className
    )}>
      <MaxWidthWrapper>
        {(title || description) && (
          <div className="mb-12 md:mb-16 max-w-3xl">
            {title && (
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
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
