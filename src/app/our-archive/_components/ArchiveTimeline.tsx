"use client";

import { Star, Award, Compass, Milestone as MilestoneIcon } from "lucide-react";
import { motion } from "framer-motion";

const DECORATION = [
  { icon: Award, color: "text-primary bg-primary/10" },
  { icon: MilestoneIcon, color: "text-secondary bg-secondary/10" },
  { icon: Compass, color: "text-emerald-600 bg-emerald-500/10" },
  { icon: Star, color: "text-primary bg-primary/10" },
];

interface MilestoneRow {
  id: string;
  year: string;
  title: string;
  description: string | null;
}

export default function ArchiveTimeline({ milestones }: { milestones: MilestoneRow[] }) {
  if (milestones.length === 0) {
    return (
      <div className="text-center py-16 max-w-xl mx-auto">
        <p className="text-slate-500 font-medium">
          Our timeline is currently being curated. Check back soon for our club's history of milestones.
        </p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-200 ml-4 md:ml-36 space-y-10 py-4">
      {milestones.map((milestone, index) => {
        const { icon: Icon, color } = DECORATION[index % DECORATION.length];
        return (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (index % 10) * 0.1 }}
            className="relative pl-8 md:pl-10"
          >
            {/* Year label */}
            <span className="hidden md:flex absolute right-full mr-10 top-1 text-xl lg:text-2xl font-black text-[#0B132B] select-none whitespace-nowrap">
              {milestone.year}
            </span>

            {/* Bullet node */}
            <span className={`absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${color}`}>
              <Icon className="h-4 w-4" />
            </span>

            {/* Mobile year badge */}
            <span className="flex md:hidden text-sm font-black text-secondary mb-1">
              {milestone.year}
            </span>

            {/* Milestone card */}
            <div className="bg-[#FAF9F6] border border-slate-200/60 p-5 md:p-6 rounded-2xl space-y-2 hover:border-slate-300 hover:shadow-sm transition-all duration-300">
              <h3 className="text-base font-black text-[#0B132B]">{milestone.title}</h3>
              {milestone.description && (
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                  {milestone.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
