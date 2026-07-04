"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, Mail, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const displayMembers = council.slice(0, 4); // Limit to top 4 for dashboard highlight
  const [activeIdx, setActiveIdx] = useState(0);

  if (displayMembers.length === 0) return null;
  const activeMember = displayMembers[activeIdx];

  return (
    <section className="py-16 md:py-24 space-y-12">
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
          Club Leadership
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Meet Our Executive Council
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nurturing projects, building campaigns, and guiding members toward global professional excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center max-w-5xl mx-auto">
        {/* Left Side: Dynamic Profile Details Card */}
        <div className="lg:col-span-2 bg-card border border-primary/10 p-8 rounded-3xl shadow-lg flex flex-col items-center text-center space-y-6">
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 shadow-inner">
            <Image
              src={activeMember.imageUrl || "/user.png"}
              alt={activeMember.name}
              fill
              className="object-cover"
              sizes="144px"
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-foreground">{activeMember.name}</h3>
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
              <Mail className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>

        {/* Right Side: Interactive Selection Dashboard */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          {displayMembers.map((member, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={member.id}
                onClick={() => setActiveIdx(idx)}
                className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-primary/5 border-primary shadow-md translate-x-1"
                    : "bg-card border-primary/10 hover:border-primary/20 hover:bg-primary/5"
                }`}
              >
                <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                  isActive ? "border-primary" : "border-primary/20"
                }`}>
                  <Image
                    src={member.imageUrl || "/user.png"}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className={`font-bold text-sm truncate ${isActive ? "text-primary" : "text-foreground"}`}>
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