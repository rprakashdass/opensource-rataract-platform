"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Repeat, ArrowRightIcon } from "lucide-react";
import { motion } from "framer-motion";

type InitiativeCard = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  frequency: string;
  instanceCount: number;
};

export default function EventsSection({ initiatives = [] }: { initiatives?: InitiativeCard[] }) {
  const cards = initiatives.length > 0 ? initiatives : [];

  return (
    <section className="py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
            Initiatives Timeline
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Initiatives In Action
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Take a look at our active campaigns. Each initiative stays as one card on the home page and opens to its manual event instances.
          </p>
        </div>
        <Link href="/events" className="w-full md:w-auto" prefetch>
          <Button variant="outline" className="w-full md:w-auto font-semibold gap-2 cursor-pointer">
            <span>Browse All Initiatives</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-primary/20 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          Active initiatives will appear here once they are created in the admin panel.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((initiative, index) => (
            <motion.div
              key={initiative.id}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative rounded-2xl overflow-hidden border border-primary/10 bg-primary/5 backdrop-blur-sm flex flex-col justify-between hover:shadow-xl hover:border-primary/20 transition-all"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={initiative.coverImage}
                  alt={initiative.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="absolute top-4 left-4 text-[10px] font-extrabold bg-primary text-primary-foreground uppercase px-2.5 py-1 rounded-full shadow">
                  {initiative.frequency}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {initiative.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{initiative.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <Repeat className="h-4 w-4 text-primary" />
                    <span>{initiative.frequency}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{initiative.instanceCount} instances</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/events/${initiative.slug}`} prefetch>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                      <span>View initiative</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
