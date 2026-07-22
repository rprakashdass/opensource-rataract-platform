"use client";

import React from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import {
  RevealBlock,
  SectionHeader,
  PersonCard,
  InvitePanel,
  EmptyState,
} from "@/components/ui/public/v2";
import { formatDesignations } from "@/lib/utils";

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

export default function TeamClient({ board, members, settings }: TeamClientProps) {
  const hasBoard = board.length > 0;
  const generalMembers = members.filter(m => !board.some(b => b.member.id === m.id));
  const hasMembers = generalMembers.length > 0;

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
                    />
                  </RevealBlock>
                );
              })}
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      {/* ─── GENERAL MEMBERS SECTION ─── */}
      <section className="py-20 md:py-28 bg-paper">
        <MaxWidthWrapper>
          <SectionHeader
            eyebrow={settings?.teamEyebrow || "Our community"}
            heading={settings?.teamMembersTitle || "The people behind the impact."}
          />
          {hasMembers ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
              {generalMembers.map((member, idx) => {
                const activeBoardDesignation = formatDesignations(member.boardMemberships);
                const portfoliosStr = member.portfolioAssignments?.map(pa => pa.portfolio.name).join(", ");
                const roleDisplay = activeBoardDesignation
                  ? `${activeBoardDesignation}${portfoliosStr ? ` • ${portfoliosStr}` : ""}`
                  : (portfoliosStr || member.profession);
                return (
                  <RevealBlock key={member.id} delay={(idx % 5) * 0.04}>
                    <PersonCard
                      name={member.name || "Member"}
                      role={roleDisplay}
                      photoUrl={member.avatar}
                      compact
                    />
                  </RevealBlock>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="The roster is still being written."
              detail="Our members will take their place here as the club adds them."
            />
          )}
        </MaxWidthWrapper>
      </section>

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
