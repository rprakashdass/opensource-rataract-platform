"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface InitiativeEvent {
  id: string;
  title: string;
  startDate: Date | string;
  location?: string | null;
  imageUrl?: string | null;
  category?: string | null;
}

interface EventsSectionProps {
  events: InitiativeEvent[];
}

export default function EventsSection({ events }: EventsSectionProps) {
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
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/20 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No initiative events yet. Admins can mark events as &quot;Initiative&quot; when creating them.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative rounded-2xl overflow-hidden border border-primary/10 bg-primary/5 backdrop-blur-sm flex flex-col justify-between hover:shadow-xl hover:border-primary/20 transition-all"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-primary/10">
                {event.imageUrl ? (
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-primary/30">
                    <Calendar className="h-16 w-16" />
                  </div>
                )}
                <span className="absolute top-4 left-4 text-[10px] font-extrabold bg-primary text-primary-foreground uppercase px-2.5 py-1 rounded-full shadow">
                  Initiative
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
                    <span>
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
