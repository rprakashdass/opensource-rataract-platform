"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string;
  imageUrl: string;
  roles: Array<{
    position: string;
    memberType: string;
  }>;
}

export default function BoardCouncil({ members }: { members: Member[] }) {
  const council = members.filter(m => {
    const position = m.roles[0]?.position || "Member";
    return position !== "Member" && position !== "" && position !== "General Member";
  });
  const displayMembers = council.slice(0, 4);
  const [activeIdx, setActiveIdx] = useState(0);

  if (displayMembers.length === 0) return null;
  const activeMember = displayMembers[activeIdx];

  return (
    <section className="py-12 md:py-24 space-y-10 md:space-y-12">
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
          Club Leadership
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Meet Our Executive Council
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nurturing projects, building campaigns, and guiding members toward global professional excellence.
        </p>
      </div>

      {/* Mobile: vertical stack; Desktop: 5-col grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 lg:gap-8 items-center max-w-5xl mx-auto">
        {/* Active Profile Card */}
        <div className="w-full lg:col-span-2 bg-card border border-primary/10 p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col items-center text-center space-y-5">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-primary/20 shadow-inner">
            <Image
              src={activeMember.imageUrl || "/user.png"}
              alt={activeMember.name}
              fill
              className="object-cover"
              sizes="144px"
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">{activeMember.name}</h3>
            <span className="px-3.5 py-1 inline-flex text-xs font-bold rounded-full bg-primary/10 text-primary uppercase border border-primary/20 tracking-wider">
              {activeMember.roles[0]?.position || "Council Member"}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Responsible for directing organizational campaigns, coordinating community project divisions, and hosting core workshops.
          </p>

          <div className="flex gap-2">
            <a
              href="mailto:contact@rotaract.org"
              className="p-2.5 rounded-full border border-primary/10 hover:border-primary/40 hover:text-primary transition-all text-muted-foreground"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Member selector grid — 2 cols on mobile, 2 cols on desktop (within the 3-col span) */}
        <div className="w-full lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
          {displayMembers.map((member, idx) => {
            if (idx === activeIdx) return null;
            return (
              <button
                key={member.id}
                onClick={() => setActiveIdx(idx)}
                className="p-4 rounded-2xl border text-left flex items-center gap-3 transition-all duration-300 cursor-pointer bg-card border-primary/10 hover:border-primary/30 hover:bg-primary/5 active:scale-95"
              >
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                  <Image
                    src={member.imageUrl || "/user.png"}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="overflow-hidden min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm truncate text-foreground">
                    {member.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold mt-0.5">
                    {member.roles[0]?.position || "Council"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}