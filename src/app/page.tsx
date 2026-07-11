import { getHomeBaseData, getHomeImpact, getHomeNews } from "@/features/public/queries/getHomeData";
import { getPublicProjects } from "@/features/public/queries/getPublicProjects";
import { getPublicEvents } from "@/features/public/queries/getPublicEvents";
import { prisma } from "@/lib/prisma";
import React from "react";
import { Sparkles } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F6]">
        <div className="max-w-md text-center space-y-4">
          <Sparkles className="w-12 h-12 text-[#F7A800] mx-auto opacity-80" />
          <h1 className="text-2xl font-black text-[#0B132B]">Every great journey starts somewhere.</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome! This club platform is currently being set up. Check back soon for stories, events, and opportunities to make a difference.
          </p>
        </div>
      </div>
    );
  }

  const clubId = data.club.id;
  const gallerySettings = (data.settings as any) || {};
  const galleryWhere: any = { clubId, type: "IMAGE" };
  if (gallerySettings.galleryShowFeatured) galleryWhere.isFeatured = true;
  if (gallerySettings.galleryAlbumId) galleryWhere.albumId = gallerySettings.galleryAlbumId;

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
