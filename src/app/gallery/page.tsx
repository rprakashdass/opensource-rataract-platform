import { getPublicGalleryPhotos } from "@/features/public/queries/getPublicGalleryPhotos";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import Image from "next/image";
import { Camera } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/ui/public/PageHero";
import { CmsText } from "@/components/cms/CmsText";
import { ArrowRight } from "lucide-react";

interface GalleryCopy {
  galleryTitle?: string | null;
  gallerySubtitle?: string | null;
  galleryCTA?: string | null;
  galleryCTALink?: string | null;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isPreview = resolvedParams?.preview === "true";

  const data: any = await getPublicGalleryPhotos();

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
        <div className="text-center text-slate-500">Failed to load gallery.</div>
      </div>
    );
  }

  const photos: any[] = data.photos || [];
  const copy: GalleryCopy = data.settings || {};

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <PageHero
        eyebrow="Archive"
        title={<CmsText channel="gallery" initial={copy} field="galleryTitle" fallback="Moments & Memories." isPreview={isPreview} />}
        subtitle={<CmsText channel="gallery" initial={copy} field="gallerySubtitle" fallback="Chronological snapshots of our fellowship, project drives, and installation ceremonies." isPreview={isPreview} />}
      >
        {copy.galleryCTALink && (
          <Link
            href={copy.galleryCTALink}
            className="inline-flex items-center gap-2 bg-[#0B132B] hover:bg-[#F7A800] text-white hover:text-[#0B132B] font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-colors shadow-md"
          >
            {copy.galleryCTA || "Learn More"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </PageHero>

      <section className="py-28 px-6 md:px-12">
        <MaxWidthWrapper className="max-w-7xl mx-auto">
          {photos.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {photos.map((photo) => {
                const label = photo.title || photo.event?.title || photo.project?.title;
                return (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-2xl break-inside-avoid bg-slate-100"
                  >
                    <Image
                      src={photo.url}
                      alt={label || "Club memory"}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                    {/* Hover overlay with title */}
                    {label && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-black text-sm leading-tight line-clamp-2 tracking-wide">
                            {label}
                          </p>
                          {photo.event && (
                            <span className="text-[#F7A800] text-[10px] font-black uppercase tracking-widest mt-1 block">
                              Event Memory
                            </span>
                          )}
                          {photo.project && !photo.event && (
                            <span className="text-[#F7A800] text-[10px] font-black uppercase tracking-widest mt-1 block">
                              Initiative
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200 max-w-2xl mx-auto shadow-sm">
              <Camera className="w-12 h-12 text-[#F7A800] mx-auto mb-6 opacity-80" />
              <h3 className="text-2xl font-black text-[#0B132B] mb-3">Every great journey starts somewhere.</h3>
              <p className="text-slate-500 font-medium">
                Photo memories from events and projects will appear here as they are uploaded.
              </p>
            </div>
          )}
        </MaxWidthWrapper>
      </section>
    </main>
  );
}
