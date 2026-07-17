"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn, getGoogleDriveDirectLink } from "@/lib/utils";

/** Portrait 4:5, name, role, and the human line. No pastel backgrounds. */
export function PersonCard({
  name,
  role,
  photoUrl,
  humanLine,
  compact = false,
  className,
}: {
  name: string;
  role?: string | null;
  photoUrl?: string | null;
  humanLine?: string | null;
  compact?: boolean;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const url = photoUrl ? getGoogleDriveDirectLink(photoUrl) : null;
  const initial = name?.charAt(0)?.toUpperCase() || "•";

  return (
    <div className={cn("group", className)}>
      <div className={cn("relative overflow-hidden rounded-xl bg-wash", compact ? "aspect-square" : "aspect-[4/5]")}>
        {url && !error ? (
          <Image
            src={url}
            alt={name}
            fill
            sizes={compact ? "(max-width: 768px) 50vw, 20vw" : "(max-width: 768px) 100vw, 25vw"}
            className="object-cover thadam-grade transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            onError={() => setError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-medium italic text-ink-faint text-5xl">{initial}</span>
          </div>
        )}
      </div>
      <div className={cn(compact ? "pt-3" : "pt-4")}>
        <p className={cn("font-display font-medium text-ink leading-snug", compact ? "text-base" : "text-lg")}>
          {name}
        </p>
        {role && (
          <p className="text-[13px] font-medium text-ink-faint mt-0.5">{role}</p>
        )}
        {humanLine && !compact && (
          <p className="text-sm text-ink-soft mt-2 leading-relaxed italic">&ldquo;{humanLine}&rdquo;</p>
        )}
      </div>
    </div>
  );
}
