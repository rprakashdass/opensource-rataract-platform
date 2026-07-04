"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Calendar, MapPin, X } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;
  coverImage: string;
}

export default function EventsFeed({ initialEvents }: { initialEvents: Event[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UPCOMING" | "COMPLETED">("ALL");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = initialEvents.filter((event) => {
    const nameMatch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                      event.description.toLowerCase().includes(search.toLowerCase());
    
    const eventDate = new Date(event.date);
    const today = new Date();
    const isUpcoming = eventDate >= today;

    if (statusFilter === "ALL") return nameMatch;
    if (statusFilter === "UPCOMING") return nameMatch && isUpcoming;
    if (statusFilter === "COMPLETED") return nameMatch && !isUpcoming;
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
            placeholder="Search events by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10">
          {(["ALL", "UPCOMING", "COMPLETED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                statusFilter === tab
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? "All Initiatives" : tab === "UPCOMING" ? "Upcoming" : "Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Event Cards */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No events found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
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
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details slide overlay */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-primary/15 max-w-lg w-full rounded-3xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[16/9] w-full">
              <img
                src={selectedEvent.coverImage}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8 space-y-6">
              <h2 className="text-2xl font-black text-foreground">{selectedEvent.title}</h2>
              
              <div className="flex gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest border-y border-primary/10 py-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">About Initiative</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
