"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Cake, CalendarDays, PartyPopper } from "lucide-react";
import { formatIST } from "@/lib/date-utils";
import { MonthBirthday, MonthEvent } from "@/features/members/queries/getThisMonthHighlights";

const MONTH_NAME = new Date().toLocaleString("en-US", { month: "long" });

function ShoutoutSquare({
  imageUrl,
  fallbackLabel,
  kind,
  title,
  dateLabel,
  highlighted,
  href,
}: {
  imageUrl: string | null;
  fallbackLabel: string;
  kind: "birthday" | "event";
  title: string;
  dateLabel: string;
  highlighted?: boolean;
  href?: string;
}) {
  const [error, setError] = useState(false);
  const showImage = imageUrl && !error;
  const Icon = kind === "birthday" ? Cake : CalendarDays;

  const card = (
    <div
      className={`relative shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-brand to-gold ${
        highlighted ? "ring-2 ring-brand ring-offset-2 ring-offset-wash" : ""
      }`}
    >
      {showImage ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="176px"
          className="object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-medium italic text-white/90 text-5xl">
            {fallbackLabel}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

      <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-brand-deep" />
      </div>

      {highlighted && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-brand text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
          <PartyPopper className="w-3 h-3" /> Today
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-semibold text-sm leading-tight truncate">{title}</p>
        <p className="text-white/80 text-xs mt-0.5">{dateLabel}</p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block hover:opacity-90 transition-opacity">
      {card}
    </Link>
  ) : (
    card
  );
}

export function MonthShoutoutRow({
  birthdays,
  events,
  eventHrefBase,
  className,
}: {
  birthdays: MonthBirthday[];
  events: MonthEvent[];
  eventHrefBase: string;
  className?: string;
}) {
  if (birthdays.length === 0 && events.length === 0) return null;

  return (
    <div className={`bg-wash rounded-2xl border border-hairline shadow-sm p-5 space-y-4 ${className || ""}`}>
      <h2 className="text-base font-semibold text-ink">This Month in {MONTH_NAME}</h2>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1">
        {birthdays.map((b) => (
          <div key={b.id} className="snap-start">
            <ShoutoutSquare
              imageUrl={b.avatar}
              fallbackLabel={(b.name || "M").charAt(0).toUpperCase()}
              kind="birthday"
              title={b.name || "Member"}
              dateLabel={b.isToday ? "Birthday today 🎂" : `Birthday · ${MONTH_NAME.slice(0, 3)} ${b.day}`}
              highlighted={b.isToday}
            />
          </div>
        ))}
        {events.map((e) => (
          <div key={e.id} className="snap-start">
            <ShoutoutSquare
              imageUrl={e.posterUrl}
              fallbackLabel={e.title.charAt(0).toUpperCase()}
              kind="event"
              title={e.title}
              dateLabel={formatIST(e.startTime, "MMM d")}
              href={`${eventHrefBase}/${e.id}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
