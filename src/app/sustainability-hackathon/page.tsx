"use client";

import React, { useState } from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { Terminal, Shield, Cpu, Code2, Globe, Calendar, Clock, Trophy, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const TRACKS = [
  {
    icon: Code2,
    title: "Clean Energy Code",
    description: "Develop smart energy tracking plugins, solar grid coordination platforms, or home energy reduction widgets.",
    accent: "border-green-500/30 text-green-500 bg-green-500/5",
  },
  {
    icon: Cpu,
    title: "Smart Waste Grid",
    description: "Create AI image models classifying recyclables, waste pickup optimization maps, or municipal tracking tools.",
    accent: "border-cyan-500/30 text-cyan-500 bg-cyan-500/5",
  },
  {
    icon: Globe,
    title: "Climate Education Platforms",
    description: "Build gamified interactive carbon calculators, school quiz directories, or localized climate timeline widgets.",
    accent: "border-purple-500/30 text-purple-500 bg-purple-500/5",
  },
];

const SCHEDULE = [
  { time: "09:00 AM", event: "Opening Ceremony & Track Disclosures" },
  { time: "11:00 AM", event: "Team Formation & IDE Configuration Cells" },
  { time: "02:00 PM", event: "Technical Mentorship: API Integrations & Database Pools" },
  { time: "09:00 PM", event: "Mid-way Progress Pitch & Code Review Nodes" },
];

export default function SustainabilityHackathonPage() {
  const [terminalLine, setTerminalLine] = useState("await platform.compileCode();");
  const [terminalOutput, setTerminalOutput] = useState("Initializing hackathon container... Success.");

  const runCode = () => {
    setTerminalOutput("Compiling track files...\nTracks resolved: Clean Energy, Smart Waste, Education.\nStatus: READY FOR BUILD.");
  };

  return (
    <div className="min-h-screen bg-black text-emerald-100 pt-24 pb-16 relative overflow-hidden font-mono">
      {/* Cybersecurity matrix grid backing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <MaxWidthWrapper>
        <div className="space-y-16 max-w-5xl mx-auto">
          {/* Cyber Terminal Title */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs text-green-500 font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse">
              <Terminal className="h-4 w-4" />
              <span>Rotaract Hackathon Node</span>
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight uppercase">
              Sustainability Hackathon 2026
            </h1>
            <p className="text-xs md:text-sm text-emerald-400/80 leading-relaxed font-sans max-w-lg mx-auto">
              A 48-hour technology sprint building digital tools for carbon mitigation, solar networks, and environmental education.
            </p>
          </div>

          {/* Interactive Hacker Terminal Simulator */}
          <div className="bg-black border border-green-500/20 rounded-3xl overflow-hidden shadow-2xl max-w-3xl mx-auto">
            {/* Terminal bar */}
            <div className="bg-emerald-950/30 px-6 py-3 border-b border-green-500/20 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-semibold">sys_bash.sh</span>
            </div>

            {/* Terminal Body */}
            <div className="p-8 space-y-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-500/50 text-xs">
                  <span>rotaract@terminal:~$</span>
                  <span className="text-green-400 font-bold">{terminalLine}</span>
                </div>
                <pre className="text-xs text-emerald-300 bg-emerald-950/10 p-4 rounded-xl border border-green-500/10 leading-relaxed overflow-x-auto">
                  {terminalOutput}
                </pre>
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={runCode}
                  className="bg-green-500 hover:bg-green-600 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-102 transition-all cursor-pointer"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Execute Node</span>
                </button>
                <span className="text-[10px] text-emerald-500/50 font-sans">Click Execute to resolve tracks</span>
              </div>
            </div>
          </div>

          {/* Matrix tracks grid */}
          <div className="space-y-8 pt-8">
            <h3 className="text-xl font-bold uppercase tracking-widest text-white border-b border-green-500/20 pb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Project Vertical Tracks</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TRACKS.map((track, idx) => {
                const Icon = track.icon;
                return (
                  <div
                    key={idx}
                    className={`border p-8 rounded-3xl backdrop-blur-sm space-y-4 flex flex-col justify-between hover:scale-102 transition-transform duration-300 ${track.accent}`}
                  >
                    <div className="space-y-4">
                      <div className="p-3.5 bg-emerald-950/30 w-fit rounded-2xl border border-green-500/20">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h4 className="font-extrabold text-lg text-white uppercase tracking-wider">{track.title}</h4>
                      <p className="text-xs text-emerald-400 leading-relaxed font-sans">
                        {track.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule list */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pt-8 items-start">
            {/* Prizes block */}
            <div className="md:col-span-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-8 rounded-3xl space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-green-500">Hackathon Prizes</span>
                <h4 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-green-400" />
                  <span>Pool Rewards</span>
                </h4>
              </div>
              <ul className="space-y-4 text-xs font-bold text-emerald-300">
                <li className="flex justify-between border-b border-green-500/20 pb-2">
                  <span>1ST PLACE</span>
                  <span className="text-green-400 font-extrabold">₹500 + Domain Support</span>
                </li>
                <li className="flex justify-between border-b border-green-500/20 pb-2">
                  <span>2ND PLACE</span>
                  <span className="text-green-400 font-extrabold">₹300 + Cloud Credits</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span>3RD PLACE</span>
                  <span className="text-green-400 font-extrabold">₹200 + API Key Tier</span>
                </li>
              </ul>
            </div>

            {/* Schedule timeline block */}
            <div className="md:col-span-3 space-y-6 bg-black border border-green-500/20 p-8 rounded-3xl">
              <h4 className="text-lg font-bold uppercase tracking-widest text-white border-b border-green-500/20 pb-3 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-green-500" />
                <span>Launch Day Timeline</span>
              </h4>
              <div className="space-y-4">
                {SCHEDULE.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start border-b border-green-500/10 pb-4 last:border-0 last:pb-0">
                    <span className="text-xs text-green-400 font-bold bg-green-500/5 px-2.5 py-1.5 rounded-lg border border-green-500/10 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </span>
                    <span className="text-xs text-emerald-300 font-sans leading-relaxed pt-1.5">
                      {item.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
