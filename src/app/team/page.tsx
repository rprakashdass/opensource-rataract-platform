import { getPublicTeam } from "@/features/public/queries/getPublicTeam";
import { PageIntro, EmptyState } from "@/components/ui/public/v2";
import TeamClient from "./TeamClient";
import React from "react";

export default async function TeamPage() {
  const data = await getPublicTeam();

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <EmptyState
          title="The team page took a wrong turn."
          detail="We couldn't load the roster just now. Please try again in a moment."
        />
      </div>
    );
  }

  const board = data.board || [];
  const members = data.members || [];
  const portfolios = data.portfolios || [];
  const settings = (data as any).settings || {};

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageIntro
        eyebrow={settings.teamEyebrow || "Meet the team"}
        title={settings.teamTitle || "The people who make it go."}
        support={
          settings.teamSubtitle ||
          "We are a community of young leaders united by fellowship, personal development, and community impact."
        }
      />

      <TeamClient
        board={board}
        members={members}
        portfolios={portfolios}
        settings={settings}
      />
    </main>
  );
}
