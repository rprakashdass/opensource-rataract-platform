import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Folder, Image as ImageIcon, CalendarDays, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlbumUploadButton } from "./AlbumUploadButton";
import { MediaThumbnail } from "../../_components/MediaThumbnail";

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;
  const club = await getCurrentClub();
  if (!club) return <div>No club found</div>;

  const album = await prisma.album.findFirst({
    where: { id, clubId: club.id },
    include: {
      media: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      },
      event: { select: { id: true, title: true } },
      project: { select: { id: true, title: true } },
    },
  });

  if (!album) notFound();

  const coverMedia = album.coverMediaId
    ? album.media.find((m) => m.id === album.coverMediaId)
    : album.media.find((m) => m.type === "IMAGE");

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin/gallery"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Folder className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{album.title}</h1>
              {album.description && (
                <p className="text-sm text-gray-500 mt-0.5">{album.description}</p>
              )}
            </div>
          </div>

          {/* Meta badges */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Badge variant="secondary" className="gap-1.5">
              <ImageIcon className="w-3 h-3" />
              {album.media.length} {album.media.length === 1 ? "item" : "items"}
            </Badge>
            {album.event && (
              <Badge variant="outline" className="gap-1.5 text-purple-700 border-purple-200 bg-purple-50">
                <CalendarDays className="w-3 h-3" />
                Event: {album.event.title}
              </Badge>
            )}
            {album.project && (
              <Badge variant="outline" className="gap-1.5 text-blue-700 border-blue-200 bg-blue-50">
                <Layers className="w-3 h-3" />
                Project: {album.project.title}
              </Badge>
            )}
          </div>
        </div>

        {/* Upload button */}
        <div className="flex-shrink-0">
          <AlbumUploadButton albumId={album.id} albumTitle={album.title} />
        </div>
      </div>

      {/* Cover preview */}
      {coverMedia && (
        <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src={coverMedia.url}
            alt={coverMedia.altText || coverMedia.title || album.title}
            fill
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover"
            loading="eager"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <Badge className="absolute bottom-4 left-4 bg-white/90 text-gray-900 border-none shadow-sm">
            Cover Photo
          </Badge>
        </div>
      )}

      {/* Media grid */}
      {album.media.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500">
          <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">This album is empty</p>
          <p className="text-sm mt-1">Upload photos to this album from the gallery.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/admin/gallery">Go to Gallery</Link>
          </Button>
        </div>
      ) : (
        <section>
          <h2 className="text-xl font-bold mb-4">All Media</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {album.media.map((m, idx) => (
              <MediaThumbnail
                key={m.id}
                id={m.id}
                url={m.url}
                title={m.title}
                caption={m.caption}
                type={m.type}
                isCover={m.isCover}
                isFeatured={m.isFeatured}
                priority={idx < 10}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
