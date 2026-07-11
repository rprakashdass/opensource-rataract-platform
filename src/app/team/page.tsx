import { getPublicTeam } from "@/features/public/queries/getPublicTeam";
import { PageHero } from "@/components/ui/public/PageHero";
import TeamClient from "./TeamClient";
import React from "react";

export default async function TeamPage() {
  const data = await getPublicTeam();

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
        <div className="text-center text-slate-500 font-medium">Failed to load team data.</div>
      </div>
    );
  }

  const board = data.board || [];
  const members = data.members || [];
  const portfolios = data.portfolios || [];
  const settings = (data as any).settings || {};

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <PageHero 
        eyebrow={settings.teamEyebrow || "Meet The Team"}
        title={settings.teamTitle || "People & Leaders."}
        subtitle={settings.teamSubtitle || "We are a community of young leaders united by fellowship, personal development, and community impact."}
      />
      {/* TeamClient now handles its own full-width background sections */}
      <TeamClient 
        board={board} 
        members={members} 
        portfolios={portfolios} 
        settings={settings}
      />
    </main>
  );
}
