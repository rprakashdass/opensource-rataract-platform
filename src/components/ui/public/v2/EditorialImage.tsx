"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn, getGoogleDriveDirectLink } from "@/lib/utils";
import { THADAM_EASE } from "./reveal";

type Ratio = "4/5" | "3/2" | "16/9" | "21/9" | "square";

const RATIO_CLASS: Record<Ratio, string> = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  square: "aspect-square",
};

/**
 * The one image primitive: warm grade, curtain reveal, caption slot,
 * typographic fallback (never stock).
 */
export function EditorialImage({
  src,
  alt,
  ratio = "3/2",
  caption,
  fallbackText,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
  imgClassName,
  rounded = true,
}: {
  src?: string | null;
  alt: string;
  ratio?: Ratio;
  caption?: string | null;
  fallbackText?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  rounded?: boolean;
}) {
  const reduce = useReducedMotion();
  const url = src ? getGoogleDriveDirectLink(src) : null;

  return (
    <figure className={cn("w-full", className)}>
      <motion.div
        className={cn("relative overflow-hidden bg-wash", RATIO_CLASS[ratio], rounded && "rounded-xl")}
        initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
        whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [...THADAM_EASE] }}
      >
        {url ? (
          <motion.div
            className="absolute inset-0"
            initial={reduce ? {} : { scale: 1.08 }}
            whileInView={reduce ? {} : { scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [...THADAM_EASE] }}
          >
            <Image
              src={url}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              className={cn("object-cover thadam-grade", imgClassName)}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-wash p-8">
            <span className="font-display font-medium italic text-ink-faint text-xl md:text-2xl text-center text-balance">
              {fallbackText || alt}
            </span>
          </div>
        )}
      </motion.div>
      {caption && (
        <figcaption className="mt-3 text-[13px] font-medium text-ink-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
