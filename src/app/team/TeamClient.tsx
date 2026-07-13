"use client";

import React from "react";
import { QuoteCard } from "@/components/ui/public/QuoteCard";
import { Sparkles } from "lucide-react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { EditorialSection } from "@/components/ui/public/EditorialSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedGrid, AnimatedImage } from "@/components/ui/motion/AnimatedLayouts";

interface BoardMember {
  id: string;
  position: string;
  order: number;
  member: {
    id: string;
    name: string | null;
    avatar: string | null;
    profession: string | null;
    joinedAt: Date | string;
    websiteQuote: string | null;
    portfolioAssignments: Array<{ portfolio: { id: string; name: string } }>;
  };
}

interface Member {
  id: string;
  name: string | null;
  avatar: string | null;
  joinedAt: Date | string;
  profession: string | null;
  boardMemberships: any[];
  portfolioAssignments: Array<{ portfolio: { id: string; name: string } }>;
}

interface Portfolio {
  id: string;
  name: string;
}

interface TeamClientProps {
  board: BoardMember[];
  members: Member[];
  portfolios: Portfolio[];
  settings?: any;
}

const COLORS: ("peach" | "blue" | "green" | "lavender" | "slate")[] = ["peach", "blue", "green", "lavender", "slate"];

export default function TeamClient({ board, members, settings }: TeamClientProps) {
  const hasBoard = board.length > 0;
  const hasMembers = members.length > 0;

  return (
    <div className="bg-white">

      {/* ─── BOARD SECTION (Instrument Style Quote Cards) ─── */}
      {hasBoard && (
        <section className="py-24 md:py-32 bg-[#FAF9F6] border-y border-slate-200/50">
          <MaxWidthWrapper>
            <div className="mb-20 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-medium text-[#0B132B] tracking-tight leading-[1.1]">
                {settings?.teamLeadershipTitle || "How we lead matters just as much as what we achieve. See what the board has to say."}
              </h2>
            </div>

            <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {board.map((m, idx) => (
                <div key={m.id} className="min-h-[400px]">
                  <QuoteCard
                    quote={m.member.websiteQuote || `Serving as ${m.position} allows me to connect deeply with our community and push the boundaries of what we can build together this year.`}
                    authorName={m.member.name || "Member"}
                    authorRole={m.position}
                    avatarUrl={m.member.avatar || undefined}
                    colorTheme={COLORS[idx % COLORS.length]}
                  />
                </div>
              ))}
            </AnimatedGrid>
          </MaxWidthWrapper>
        </section>
      )}

      {/* ─── GENERAL MEMBERS SECTION ─── */}
      <EditorialSection
        eyebrow={settings?.teamEyebrow || "Our Community"}
        heading={settings?.teamMembersTitle || "The people behind the impact."}
        background="white"
      >
        {hasMembers ? (
          <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16 mt-8">
            {members.map((member, idx) => {
              const activeBoard = member.boardMemberships?.find(
                b => b.financialYear?.status === "ACTIVE" || !b.leftAt
              );
              return (
                <div key={member.id} className="flex flex-col group cursor-pointer">
                  {/* Huge Image Focus */}
                  <div className="aspect-square w-full rounded-3xl overflow-hidden bg-slate-50 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                    {member.avatar ? (
                      <AnimatedImage 
                        src={member.avatar} 
                        alt={member.name || ""} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 font-serif italic text-6xl">
                        {(member.name || "M").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="px-2">
                    <h3 className="text-xl font-bold text-[#0B132B] group-hover:text-[#F7A800] transition-colors">{member.name}</h3>
                    {(activeBoard?.position || member.profession) && (
                      <p className="text-slate-500 font-medium text-sm mt-1">
                        {activeBoard?.position || member.profession}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </AnimatedGrid>
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto shadow-sm">
            <Sparkles className="w-12 h-12 text-[#F7A800] mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-black text-[#0B132B] mb-2">Every great journey starts somewhere.</h3>
            <p className="text-slate-500 font-medium">Members will appear here once they are added.</p>
          </div>
        )}
      </EditorialSection>

      {/* ─── JOIN CTA SECTION ─── */}
      {settings?.teamJoinCTA && (
        <section className="py-24 bg-[#FAF9F6] text-center border-t border-slate-200/50">
          <MaxWidthWrapper className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl font-black text-[#0B132B] tracking-tight">
              Ready to make a difference?
            </h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
              Join our community of young leaders today and build sustainable impact.
            </p>
            <div className="pt-4">
              <Link href={settings.teamJoinCTALink || "/join"}>
                <Button className="bg-[#0B132B] hover:bg-[#F7A800] text-white hover:text-[#0B132B] font-bold rounded-full px-8 h-12 transition-all shadow-md">
                  {settings.teamJoinCTA}
                </Button>
              </Link>
            </div>
          </MaxWidthWrapper>
        </section>
      )}
    </div>
  );
}
