"use client";

import React from "react";
import { LazyMotion, domMax, m } from "framer-motion";
import { motionVariants } from "@/lib/motion-tokens";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <LazyMotion features={domMax}>
      <m.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={motionVariants.fadeInUp}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
