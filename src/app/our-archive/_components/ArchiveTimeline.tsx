"use client";

import { RevealBlock, TimelineRow, EmptyState } from "@/components/ui/public/v2";

interface MilestoneRow {
  id: string;
  year: string;
  title: string;
  description: string | null;
}

export default function ArchiveTimeline({ milestones }: { milestones: MilestoneRow[] }) {
  if (milestones.length === 0) {
    return (
      <EmptyState
        title="The first pages of this archive are still being pressed."
        detail="Our milestones are being curated by the board. Check back soon to walk through the club's history."
      />
    );
  }

  return (
    <RevealBlock className="border-t border-hairline">
      {milestones.map((milestone) => (
        <TimelineRow
          key={milestone.id}
          marker={milestone.year}
          title={milestone.title}
          description={milestone.description}
        />
      ))}
    </RevealBlock>
  );
}
