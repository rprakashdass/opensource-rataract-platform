import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Folder, Image as ImageIcon, CalendarDays, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/portal";
import { Button } from "@/components/ui/button";
import { AlbumUploadButton } from "./AlbumUploadButton";
import { DeleteAlbumButton } from "./DeleteAlbumButton";
import { RenameAlbumButton } from "./RenameAlbumButton";
import { MediaThumbnail } from "../../_components/MediaThumbnail";

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;
  const club = await getCurrentClub();
  if (!club) return <div>No club found</div>;

  const allAlbums = await prisma.album.findMany({
    where: { clubId: club.id },
    select: { id: true, title: true }
  });

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
      <PageHeader
        title={album.title}
        description={album.description || undefined}
        backHref="/admin/gallery"
        backLabel="Back to Gallery"
        className="mb-0"
        actions={
          <>
            <RenameAlbumButton
              albumId={album.id}
              albumTitle={album.title}
              albumDescription={album.description}
              isLinkedToEventOrProject={!!(album.event || album.project)}
            />
            <DeleteAlbumButton albumId={album.id} albumTitle={album.title} />
            <AlbumUploadButton albumId={album.id} albumTitle={album.title} />
          </>
        }
      />

      {/* Meta badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="gap-1.5">
          <ImageIcon className="w-3 h-3" />
          {album.media.length} {album.media.length === 1 ? "item" : "items"}
        </Badge>
        {album.event && (
          <Badge variant="outline" className="gap-1.5 text-brand border-pink-200 bg-pink-50">
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

      {/* Cover preview */}
      {coverMedia && (
        <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden bg-slate-100">
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
          <Badge className="absolute bottom-4 left-4 bg-white/90 text-slate-900 border-none shadow-sm">
            Cover Photo
          </Badge>
        </div>
      )}

      {/* Media grid */}
      {album.media.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <Folder className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">This album is empty</p>
          <p className="text-sm mt-1">Upload photos to this album from the gallery.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/admin/gallery">Go to Gallery</Link>
          </Button>
        </div>
      ) : (
        <section>
          <h2 className="text-base font-semibold text-slate-900 mb-4">All Media</h2>
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
                availableAlbums={allAlbums.filter(a => a.id !== album.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
