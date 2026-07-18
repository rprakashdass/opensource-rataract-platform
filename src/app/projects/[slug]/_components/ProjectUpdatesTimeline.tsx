"use client";

import React, { useState } from "react";
import { TimelineRow, EditorialImage, QuietLink } from "@/components/ui/public/v2";
import { Button } from "@/components/ui/button";
import { getProjectUpdatesPage } from "@/features/public/actions/getProjectUpdates";

export default function ProjectUpdatesTimeline({ projectId, initialData }: { projectId: string, initialData: any }) {
  const [updates, setUpdates] = useState(initialData.updates);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const res = await getProjectUpdatesPage(projectId, nextPage);
      setUpdates((prev: any[]) => [...prev, ...res.updates]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (updates.length === 0) return null;

  return (
    <div className="space-y-12">
      <div className="border-t border-hairline">
        {updates.map((update: any) => (
          <TimelineRow
            key={update.id}
            marker={`Day ${update.dayNumber}`}
            title={update.title}
            description={update.body || undefined}
            meta={new Date(update.date).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          >
            {/* Impact Chips */}
            {(update.volunteerHours || update.beneficiaries) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {update.volunteerHours > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    {update.volunteerHours} hr{update.volunteerHours !== 1 ? 's' : ''}
                  </span>
                )}
                {update.beneficiaries > 0 && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {update.beneficiaries} benefited
                  </span>
                )}
              </div>
            )}

            {/* Participants */}
            {update.participants && update.participants.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex -space-x-2 overflow-hidden">
                  {update.participants.slice(0, 5).map((p: any, i: number) => (
                    p.member.avatar ? (
                      <img key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src={p.member.avatar} alt={p.member.name} title={p.member.name} />
                    ) : (
                      <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-500" title={p.member.name}>
                        {p.member.name.charAt(0)}
                      </div>
                    )
                  ))}
                  {update.participants.length > 5 && (
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-500">
                      +{update.participants.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500">contributed</span>
              </div>
            )}

            {/* Photos Strip */}
            {update.media && update.media.length > 0 && (
              <div className="flex gap-4 mt-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {update.media.map((m: any, i: number) => (
                  <div key={i} className="flex-none w-48 relative aspect-[3/2] rounded-lg overflow-hidden border border-slate-200">
                    <EditorialImage
                      src={m.url}
                      alt={`Photo for ${update.title}`}
                      ratio="3/2"
                      sizes="192px"
                    />
                  </div>
                ))}
              </div>
            )}
          </TimelineRow>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={isLoading}
            className="rounded-full px-8 py-6 text-sm"
          >
            {isLoading ? "Loading..." : "Load older updates"}
          </Button>
        </div>
      )}
    </div>
  );
}
