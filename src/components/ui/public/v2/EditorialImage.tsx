"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PawPrint } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn, getGoogleDriveDirectLink } from "@/lib/utils";
import { THADAM_EASE } from "./reveal";

/** Designed placeholder for a slot with no photo yet — a soft brand-tinted
 * gradient with a faint paw-print watermark (the club mark), never a flat
 * empty box. Shares the exact same `absolute inset-0` footprint as the real
 * image it stands in for, so no layout ever depends on this rendering. */
function NoPhotoFill({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-wash via-paper to-wash p-8">
      <PawPrint
        className="absolute h-[70%] w-[70%] text-brand/[0.07] rotate-[-14deg]"
        strokeWidth={1}
        aria-hidden
      />
      <span className="relative font-display font-medium italic text-ink-faint text-xl md:text-2xl text-center text-balance">
        {text}
      </span>
    </div>
  );
}

type Ratio = "4/5" | "3/2" | "16/9" | "21/9" | "square" | "natural";

const RATIO_CLASS: Partial<Record<Ratio, string>> = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  square: "aspect-square",
};

/**
 * The one image primitive: warm grade, curtain reveal, caption slot,
 * typographic fallback (never stock).
 *
 * ratio="natural" skips the fixed-crop box entirely (no object-cover) — use
 * it for designed artwork like posters, where cropping to a fixed box cuts
 * through text/layout instead of just tightening a photo.
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
  const [error, setError] = useState(false);
  const url = src ? getGoogleDriveDirectLink(src) : null;

  if (ratio === "natural") {
    return (
      <figure className={cn("w-full", className)}>
        <motion.div
          className={cn("relative overflow-hidden bg-wash", rounded && "rounded-xl", "shadow-sm")}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.7, ease: [...THADAM_EASE] }}
        >
          {url && !error ? (
            <Image
              src={url}
              alt={alt}
              width={0}
              height={0}
              sizes={sizes}
              priority={priority}
              className={cn("w-full h-auto thadam-grade", imgClassName)}
              onError={() => setError(true)}
            />
          ) : (
            <div className="relative aspect-[4/5]">
              <NoPhotoFill text={fallbackText || alt} />
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

  return (
    <figure className={cn("w-full", className)}>
      <motion.div
        className={cn("relative overflow-hidden bg-wash", RATIO_CLASS[ratio], rounded && "rounded-xl")}
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.01 }}
        transition={{ duration: 0.7, ease: [...THADAM_EASE] }}
      >
        {url && !error ? (
          <motion.div
            className="absolute inset-0"
            initial={reduce ? {} : { scale: 1.05 }}
            whileInView={reduce ? {} : { scale: 1 }}
            viewport={{ once: true, amount: 0.01 }}
            transition={{ duration: 0.9, ease: [...THADAM_EASE] }}
          >
            <Image
              src={url}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              className={cn("object-cover thadam-grade", imgClassName)}
              onError={() => setError(true)}
            />
          </motion.div>
        ) : (
          <NoPhotoFill text={fallbackText || alt} />
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
