import { getHomeBaseData, getHomeImpact, getHomeNews } from "@/features/public/queries/getHomeData";
import { getPublicProjects } from "@/features/public/queries/getPublicProjects";
import { getPublicEvents } from "@/features/public/queries/getPublicEvents";
import { prisma } from "@/lib/prisma";
import React from "react";
import HomeClientWrapper from "./_components/HomeClientWrapper";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isPreview = resolvedParams?.preview === "true";

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
  const galleryWhere: any = { 
    clubId, 
    type: "IMAGE",
    albumId: gallerySettings.galleryAlbumId ? gallerySettings.galleryAlbumId : { not: null }
  };
  if (gallerySettings.galleryShowFeatured) galleryWhere.isFeatured = true;

  // Run database queries in parallel on the server
  const [impact, photos, projectsData, eventsData, news] = await Promise.all([
    getHomeImpact(clubId),
    prisma.media.findMany({
      where: galleryWhere,
      take: gallerySettings.galleryLimit || 5,
      orderBy: { createdAt: gallerySettings.galleryShowLatest === false ? "asc" : "desc" },
      select: { id: true, url: true, title: true }
    }),
    getPublicProjects(),
    getPublicEvents(),
    getHomeNews(clubId)
  ]);

  const featuredProjects = (projectsData.activeProjects || []).slice(0, 3);
  const upcomingEvents = eventsData.upcomingEvents?.slice(0, 3) || [];

  return (
    <HomeClientWrapper
      initialData={data}
      photos={photos as any}
      featuredProjects={featuredProjects}
      upcomingEvents={upcomingEvents}
      latestUpdates={news}
      isPreview={isPreview}
      fallbackImpact={impact}
    />
  );
}
