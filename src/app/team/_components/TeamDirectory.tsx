"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Mail, ShieldCheck, X } from "lucide-react";

interface Member {
  id: string;
  name: string;
  imageUrl: string;
  roles: Array<{
    id: string;
    memberType: string;
    position: string;
    yearId: string;
  }>;
}

export default function TeamDirectory({ initialMembers }: { initialMembers: Member[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "BOARD" | "MEMBER">("ALL");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const isBoard = (member: Member) => {
    const position = member.roles[0]?.position || "Member";
    return position !== "Member" && position !== "" && position !== "General Member";
  };

  // Filter then sort: board/council first, then general members
  const filteredMembers = initialMembers
    .filter((member) => {
      const nameMatch = member.name.toLowerCase().includes(search.toLowerCase());
      if (activeTab === "BOARD") return nameMatch && isBoard(member);
      if (activeTab === "MEMBER") return nameMatch && !isBoard(member);
      return nameMatch;
    })
    .sort((a, b) => {
      // Board members always come first
      const aIsBoard = isBoard(a) ? 0 : 1;
      const bIsBoard = isBoard(b) ? 0 : 1;
      return aIsBoard - bIsBoard;
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
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary/5 border border-primary/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10">
          {(["ALL", "BOARD", "MEMBER"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? "All Directory" : tab === "BOARD" ? "Board of Directors" : "General Members"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Profile Cards */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No members found matching your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-card border border-primary/10 p-6 rounded-2xl text-center space-y-4 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary/10 group-hover:border-primary transition-all">
                <Image
                  src={member.imageUrl || "/user.png"}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {member.name}
                </h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold truncate">
                  {member.roles[0]?.position || "Member"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Slide-over / Modal Overlay */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-primary/10 max-w-sm w-full rounded-3xl overflow-hidden p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20">
                <Image
                  src={selectedMember.imageUrl || "/user.png"}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-foreground">{selectedMember.name}</h3>
                <span className="px-3.5 py-1 inline-flex text-xs font-bold rounded-full bg-primary/10 text-primary uppercase border border-primary/20 tracking-wider">
                  {selectedMember.roles[0]?.position || "Member"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Active member contributing to community service initiatives, leadership coordinate cells, and district communication networks.
              </p>

              <div className="flex gap-2 pt-2">
                <a
                  href="mailto:member@rotaract.org"
                  className="p-2.5 rounded-full border border-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Mail className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
