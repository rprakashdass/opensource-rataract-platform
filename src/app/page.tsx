import { getHomeBaseData, getHomeImpact, getHomeNews } from "@/features/public/queries/getHomeData";
import { getPublicProjects } from "@/features/public/queries/getPublicProjects";
import { getPublicEvents } from "@/features/public/queries/getPublicEvents";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import React from "react";
import HomeClientWrapper from "./_components/HomeClientWrapper";

export const revalidate = 300;

import { draftMode } from "next/headers";
export default async function HomePage() {
  const draft = await draftMode();
  const isPreview = draft.isEnabled;

  const data = await getHomeBaseData();

  if (data?.error === "Club not initialized" || !data?.club) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-paper font-body">
        <div className="max-w-md text-center space-y-5">
          <h1 className="font-display font-medium text-3xl text-ink text-balance">
            The first footprint is coming.
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed">
            This club&apos;s home is being set up. Check back soon for stories, events, and ways to
            walk with us.
          </p>
        </div>
      </div>
    );
  }

  const clubId = data.club.id;
  const gallerySettings = (data.settings as any) || {};

  // Not wrapped in unstable_cache: the page itself is already revalidated
  // on-demand (revalidatePath("/") from updateMemories) and time-based
  // (export const revalidate above) — a second, independently-tagged cache
  // layer here only adds a way for admin edits to go stale without showing it.
  const getCuratedMemories = async (cId: string, albumId: string | null, limit: number) => {
    if (!albumId) return [];
    return prisma.media.findMany({
      where: { clubId: cId, albumId, showOnHomepage: true, type: "IMAGE" },
      orderBy: [ { sortOrder: "asc" }, { createdAt: "desc" } ],
      take: limit || 6,
      select: { id: true, url: true, title: true, altText: true }
    });
  };

  const getFeaturedUpdates = unstable_cache(
    async (cId: string) =>
      prisma.projectUpdate.findMany({
        where: { clubId: cId, isFeatured: true, isPublished: true },
        orderBy: { date: "desc" },
        take: 3,
        include: {
          media: { select: { url: true }, take: 1 },
          project: { select: { title: true, slug: true, category: true } },
        },
      }),
    ["home-featured-updates"],
    { tags: ["project-updates"], revalidate: 300 }
  );
  const [impact, photos, projectsData, eventsData, news, featuredUpdates] = await Promise.all([
    getHomeImpact(clubId),
    getCuratedMemories(clubId, gallerySettings.galleryAlbumId, gallerySettings.galleryLimit),
    getPublicProjects(),
    getPublicEvents(),
    getHomeNews(clubId),
    getFeaturedUpdates(clubId),
  ]);

  const featuredProjects = ((projectsData as any).activeProjects || []).slice(0, 3);
  const upcomingEvents = (eventsData as any).upcomingEvents?.slice(0, 3) || [];

  return (
    <HomeClientWrapper
      initialData={data}
      photos={photos as any}
      featuredProjects={featuredProjects}
      upcomingEvents={upcomingEvents}
      latestUpdates={news}
      featuredUpdates={featuredUpdates as any}
      isPreview={isPreview}
      fallbackImpact={impact}
    />
  );
}
