"use client";

import React, { useState } from "react";
import { LazyMotion, domMax, m, AnimatePresence } from "framer-motion";
import { motionVariants, springs } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

// 1. AnimatedSection - Viewport trigger entry fade & slide
export function AnimatedSection({ 
  children, 
  className,
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <LazyMotion features={domMax}>
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-8% 0px" }}
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { ...springs.default, delay } 
          }
        }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// 2. AnimatedGrid - Staggered parent reveal
export function AnimatedGrid({ 
  children, 
  className,
  staggerDelay = 0.04,
  delayChildren = 0
}: { 
  children: React.ReactNode; 
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}) {
  return (
    <LazyMotion features={domMax}>
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-8% 0px" }}
        variants={motionVariants.staggerContainer(staggerDelay, delayChildren)}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// 3. AnimatedCard - Simple child grid card fade + lift class
export function AnimatedCard({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <LazyMotion features={domMax}>
      <m.div
        variants={motionVariants.fadeInUp}
        className={cn("motion-card", className)}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

// 4. AnimatedButton - Premium touch compression button wrapper
export function AnimatedButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <LazyMotion features={domMax}>
      <m.button
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileTap={disabled ? undefined : { scale: 0.98, y: 0.5 }}
        className={cn("motion-button", className)}
      >
        {children}
      </m.button>
    </LazyMotion>
  );
}

// 5. AnimatedHero - Title line staggered entries
export function AnimatedHero({
  title,
  subtitle,
  className
}: {
  title: string;
  subtitle?: string | null;
  className?: string;
}) {
  return (
    <LazyMotion features={domMax}>
      <m.div
        initial="hidden"
        animate="visible"
        variants={motionVariants.staggerContainer(0.08, 0.05)}
        className={cn("flex flex-col items-center text-center", className)}
      >
        <h1 className="overflow-hidden">
          <m.span 
            variants={motionVariants.fadeInUp} 
            className="inline-block"
          >
            {title}
          </m.span>
        </h1>
        {subtitle && (
          <m.p 
            variants={motionVariants.fadeInUp} 
            className="inline-block"
          >
            {subtitle}
          </m.p>
        )}
      </m.div>
    </LazyMotion>
  );
}

// 6. AnimatedImage - Progressive fade and fallback
export function AnimatedImage({
  src,
  alt,
  className,
  fill = false,
  priority = false,
  sizes
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors", className)}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 skeleton-shimmer" />
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-xs italic">
          Image unavailable
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-[1s] ease-out",
            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-102 blur-md"
          )}
          style={fill ? { position: "absolute", top: 0, left: 0 } : undefined}
        />
      )}
    </div>
  );
}

// 7. AnimatedDialog - Modal overlay + pop entry
export function AnimatedDialog({
  isOpen,
  onClose,
  children,
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <LazyMotion features={domMax}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <m.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={motionVariants.backdrop}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Dialog Content */}
            <m.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={motionVariants.dialog}
              className={cn("relative bg-white rounded-3xl shadow-2xl z-10 w-full max-w-lg overflow-hidden border border-slate-100", className)}
            >
              {children}
            </m.div>
          </div>
        </LazyMotion>
      )}
    </AnimatePresence>
  );
}

// 8. AnimatedEmptyState - Empty state soft fade
export function AnimatedEmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <LazyMotion features={domMax}>
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={motionVariants.staggerContainer(0.08, 0.1)}
        className={cn("bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm max-w-md mx-auto flex flex-col items-center justify-center", className)}
      >
        <m.div variants={motionVariants.fadeInUp}>
          <Icon className="w-12 h-12 text-[#F7A800] mb-6 opacity-80" />
        </m.div>
        <m.h3 variants={motionVariants.fadeInUp} className="text-2xl font-bold text-[#0B132B] mb-2 leading-tight">
          {title}
        </m.h3>
        <m.p variants={motionVariants.fadeInUp} className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
          {description}
        </m.p>
        {actionText && onAction && (
          <m.div variants={motionVariants.fadeInUp}>
            <AnimatedButton onClick={onAction} className="bg-[#0B132B] text-white hover:bg-[#F7A800] hover:text-[#0B132B] font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full">
              {actionText}
            </AnimatedButton>
          </m.div>
        )}
      </m.div>
    </LazyMotion>
  );
}
