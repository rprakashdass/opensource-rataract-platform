"use client";

import React from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import {
  RevealBlock,
  SectionHeader,
  PersonCard,
  InvitePanel,
} from "@/components/ui/public/v2";

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
    linkedin: string | null;
    instagram: string | null;
    portfolioAssignments: Array<{ portfolio: { id: string; name: string } }>;
  };
}

interface Portfolio {
  id: string;
  name: string;
}

interface TeamClientProps {
  board: BoardMember[];
  portfolios: Portfolio[];
  settings?: any;
}

export default function TeamClient({ board, settings }: TeamClientProps) {
  const hasBoard = board.length > 0;

  return (
    <div className="bg-paper">
      {/* ─── BOARD SECTION ─── */}
      {hasBoard && (
        <section className="py-20 md:py-28 bg-wash">
          <MaxWidthWrapper>
            <SectionHeader
              eyebrow="The board"
              heading={settings?.teamLeadershipTitle || "How we lead matters just as much as what we achieve."}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {board.map((m, idx) => {
                const portfoliosStr = m.member.portfolioAssignments?.map(pa => pa.portfolio.name).join(", ");
                return (
                  <RevealBlock key={m.id} delay={(idx % 3) * 0.06}>
                    <PersonCard
                      name={m.member.name || "Member"}
                      role={m.position + (portfoliosStr ? ` • ${portfoliosStr}` : "")}
                      photoUrl={m.member.avatar}
                      humanLine={m.member.websiteQuote}
                      linkedin={m.member.linkedin}
                      instagram={m.member.instagram}
                    />
                  </RevealBlock>
                );
              })}
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      {/* ─── JOIN CTA SECTION ─── */}
      {settings?.teamJoinCTA && (
        <InvitePanel
          statement="There's a card here with your name on it."
          primaryText={settings.teamJoinCTA}
          primaryHref={settings.teamJoinCTALink || "/join"}
        />
      )}
    </div>
  );
}
