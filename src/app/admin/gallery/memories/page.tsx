import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { PageHeader } from "@/components/portal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MemoriesClient from "./MemoriesClient";
import { MemoriesUploadButton } from "./MemoriesUploadButton";

export default async function MemoriesPage() {
  const club = await getCurrentClub();
  if (!club) return <div>No club found</div>;

  const settings = await prisma.websiteSettings.findUnique({
    where: { clubId: club.id },
    select: { galleryAlbumId: true, galleryLayout: true, galleryLimit: true },
  });

  const albumId = settings?.galleryAlbumId;

  let media: any[] = [];
  if (albumId) {
    media = await prisma.media.findMany({
      where: { clubId: club.id, albumId, type: "IMAGE" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        url: true,
        title: true,
        showOnHomepage: true,
        sortOrder: true,
      },
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      <Link href="/admin/gallery" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Gallery
      </Link>

      <PageHeader
        title="Curate Memories"
        description="Select and reorder images for the public memories page and homepage gallery section."
        actions={<MemoriesUploadButton />}
      />

      <MemoriesClient
        initialMedia={media}
        initialLayout={settings?.galleryLayout || "masonry"}
        initialLimit={settings?.galleryLimit ?? 6}
      />
    </div>
  );
}
