"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Calendar, Repeat, ArrowRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  frequency: string;
  instanceCount: number;
  nextDate: string;
  location?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString + "T00:00:00Z");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

export default function EventsFeed({ initialEvents }: { initialEvents: Event[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DAILY" | "WEEKLY" | "MONTHLY">("ALL");

  const filteredEvents = initialEvents.filter((event) => {
    const nameMatch = event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "ALL") return nameMatch;
    if (statusFilter === event.frequency.toUpperCase()) return nameMatch;
    return nameMatch;
  });

  return (
    <div className="space-y-12">
      {/* Search & Filter Controls Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-primary/10 p-4 rounded-2xl">
        {/* Search input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search initiatives by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10">
          {(["ALL", "DAILY", "WEEKLY", "MONTHLY"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${statusFilter === tab
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab === "ALL" ? "All Initiatives" : tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Initiative Cards */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No initiatives found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="bg-card border border-primary/10 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-primary/25 transition-all cursor-pointer group"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-103 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="flex flex-col gap-2 pt-2 border-t border-primary/10 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Repeat className="h-4 w-4 text-primary" />
                    <span>{event.frequency}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{event.instanceCount} instances</span>
                  </div>
                  <div className="flex items-center gap-1.5 normal-case tracking-normal">
                    <span>Next: {formatDate(event.nextDate)}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs font-bold text-primary flex items-center gap-1">
                  <span>Open initiative</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
