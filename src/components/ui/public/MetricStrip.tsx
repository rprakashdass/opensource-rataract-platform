"use client";

import React from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

interface MetricStripProps {
  members?: number;
  projects?: number;
  hours?: number;
  events?: number;
  customMetrics?: { id?: string; number: string; label: string; description?: string | null }[];
}

export function MetricStrip({ members = 0, projects = 0, hours = 0, events = 0, customMetrics }: MetricStripProps) {
  const displayMetrics = customMetrics && customMetrics.length > 0 
    ? customMetrics.map(m => ({ label: m.label, value: m.number, desc: m.description }))
    : [
        { label: "Members", value: String(members), desc: null },
        { label: "Projects", value: String(projects), desc: null },
        { label: "Volunteer Hours", value: String(hours), desc: null },
        { label: "Events", value: String(events), desc: null },
      ];

  return (
    <div className="bg-white py-12 md:py-16 border-y border-slate-200/50">
      <MaxWidthWrapper>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-slate-200">
          {displayMetrics.map((metric, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0B132B] tracking-tight mb-2">
                {metric.value}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {metric.label}
              </span>
              {metric.desc && (
                <span className="text-xs text-slate-500 mt-1 font-medium">{metric.desc}</span>
              )}
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
