"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRightIcon } from "lucide-react";
import { motion } from "framer-motion";

const HIGHLIGHT_EVENTS = [
  {
    id: "e1",
    title: "Sustainability Hackathon",
    date: "July 12, 2026",
    location: "Online / Discord",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
    slug: "sustainability-hackathon",
    tag: "Technology",
  },
  {
    id: "e2",
    title: "Clean Water Project",
    date: "August 05, 2026",
    location: "Community Center",
    coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    slug: "clean-water-project",
    tag: "Community",
  },
];

export default function EventsSection() {
  return (
    <section className="py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
            Events Timeline
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Initiatives In Action
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Take a look at our upcoming and past campaigns. Join us to help support our initiatives and volunteering operations.
          </p>
        </div>
        {/* Commented out navigation to browse all events */}
        {/* <Link href="/events" className="w-full md:w-auto" prefetch>
          <Button variant="outline" className="w-full md:w-auto font-semibold gap-2 cursor-pointer">
            <span>Browse All Events</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {HIGHLIGHT_EVENTS.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="group relative rounded-2xl overflow-hidden border border-primary/10 bg-primary/5 backdrop-blur-sm flex flex-col justify-between hover:shadow-xl hover:border-primary/20 transition-all"
          >
            {/* Image Container */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <span className="absolute top-4 left-4 text-[10px] font-extrabold bg-primary text-primary-foreground uppercase px-2.5 py-1 rounded-full shadow">
                {event.tag}
              </span>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Commented out navigation links */}
              {/* <div className="pt-2">
                {event.slug === "sustainability-hackathon" ? (
                  <Link href={`/${event.slug}`} prefetch>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                      <span>View Hackathon details</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </button>
                  </Link>
                ) : (
                  <Link href="/events" prefetch>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                      <span>Learn more</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </button>
                  </Link>
                )}
              </div> */}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
