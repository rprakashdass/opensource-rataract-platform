"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Shared easing for all THADAM storytelling motion. */
export const THADAM_EASE = [0.22, 1, 0.36, 1] as const;

/** reveal.block — 24px rise + fade, once, on scroll. */
export function RevealBlock({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ duration: 0.6, delay, ease: [...THADAM_EASE] }}
    >
      {children}
    </motion.div>
  );
}

/** reveal.line — masked line-by-line slide-up for display headlines. */
export function RevealLines({
  lines,
  className,
  lineClassName,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={`block ${lineClassName || ""}`}
            initial={reduce ? { opacity: 0 } : { y: "110%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 + i * 0.08, ease: [...THADAM_EASE] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Stagger wrapper: children RevealBlocks get sequential delays via index. */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child) ? (
          <RevealBlock delay={i * stagger}>{child}</RevealBlock>
        ) : (
          child
        )
      )}
    </div>
  );
}
