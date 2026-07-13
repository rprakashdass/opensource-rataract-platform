"use client";

import React from "react";
import { LazyMotion, domMax, m } from "framer-motion";
import { springs } from "@/lib/motion-tokens";

interface LayoutRepositionProps {
  children: React.ReactNode;
  layoutId?: string;
  className?: string;
}

export function LayoutReposition({ children, layoutId, className }: LayoutRepositionProps) {
  return (
    <LazyMotion features={domMax}>
      <m.div
        layout
        layoutId={layoutId}
        transition={springs.default}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
