import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import Link from "next/link";
import { Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/portal";
import { GalleryUpload } from "./GalleryUpload";
import { CreateAlbumDialog } from "./CreateAlbumDialog";
import { MediaThumbnail } from "./_components/MediaThumbnail";

export default async function AdminGalleryPage() {
  const club = await getCurrentClub();
  if (!club) return <div>No club found</div>;

  const albums = await prisma.album.findMany({
    where: { clubId: club.id },
    include: {
      _count: { select: { media: true } },
      event: { select: { title: true } },
      project: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const media = await prisma.media.findMany({
    where: { clubId: club.id, albumId: null },
    include: {
      event: { select: { title: true } },
      project: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      <PageHeader
        title="Media & Albums"
        description="Organize your media into albums, or keep them as standalone images."
        actions={
          <>
            <CreateAlbumDialog />
            <GalleryUpload albums={albums.map(a => ({ id: a.id, title: a.title }))} />
          </>
        }
      />

      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Albums</h2>
        {albums.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
            No albums found. Create one to group your event photos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map(album => (
              <Link href={`/admin/gallery/albums/${album.id}`} key={album.id} className="block group">
                <div className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white">
                  <div className="h-40 bg-slate-100 flex items-center justify-center relative">
                    <Folder className="w-12 h-12 text-slate-300" />
                    <Badge className="absolute bottom-2 right-2 bg-white/90 text-slate-900 border-none shadow-sm">{album._count.media} Items</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 group-hover:text-brand transition-colors">{album.title}</h3>
                    {(album.event || album.project) && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        Linked to: {album.event?.title || album.project?.title}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Uncategorized Media</h2>
        {media.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
            No loose media found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((m, idx) => (
              <MediaThumbnail
                key={m.id}
                id={m.id}
                url={m.url}
                title={m.title}
                type={m.type}
                isCover={m.isCover}
                priority={idx === 0}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
