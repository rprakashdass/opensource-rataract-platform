import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import Link from "next/link";
import Image from "next/image";
import { Plus, Folder, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Media & Albums</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Organize your media into albums, or keep them as standalone images.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Note: Album creation and media uploads are now managed via Event/Project workflows with Google Drive */}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Albums</h2>
        {albums.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
            No albums found. Create one to group your event photos.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {albums.map(album => (
              <Link href={`/admin/gallery/albums/${album.id}`} key={album.id} className="block group">
                <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white">
                  <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                    <Folder className="w-12 h-12 text-gray-300" />
                    <Badge className="absolute bottom-2 right-2 bg-white/90 text-gray-900 border-none shadow-sm">{album._count.media} Items</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{album.title}</h3>
                    {(album.event || album.project) && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
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
        <h2 className="text-xl font-bold mb-4">Uncategorized Media</h2>
        {media.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
            No loose media found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map(m => (
              <Link href={`/admin/gallery/media/${m.id}`} key={m.id} className="group block">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                  {m.type === "IMAGE" ? (
                    <Image src={m.url} alt={m.title || "Media"} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {m.isCover && (
                    <Badge className="absolute top-2 left-2 bg-purple-500 text-white border-none shadow-sm text-[10px] px-1.5 py-0">Cover</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
