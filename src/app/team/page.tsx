import { getPublicTeam } from "@/features/public/queries/getPublicTeam";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { RevealBlock, Eyebrow, EmptyState } from "@/components/ui/public/v2";
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
      {/* Compact interior hero */}
      <section className="pt-40 md:pt-48 pb-14 md:pb-20 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow className="mb-5">{settings.teamEyebrow || "Meet the team"}</Eyebrow>
            <h1 className="font-display font-medium text-ink tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
              {settings.teamTitle || "The people who make it go."}
            </h1>
            <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-xl">
              {settings.teamSubtitle ||
                "We are a community of young leaders united by fellowship, personal development, and community impact."}
            </p>
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      <TeamClient
        board={board}
        members={members}
        portfolios={portfolios}
        settings={settings}
      />
    </main>
  );
}
