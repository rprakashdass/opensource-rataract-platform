import { getPublicGalleryPhotos } from "@/features/public/queries/getPublicGalleryPhotos";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import Image from "next/image";
import { CmsText } from "@/components/cms/CmsText";
import {
  RevealBlock,
  Eyebrow,
  SectionHeader,
  PillLink,
  EmptyState,
} from "@/components/ui/public/v2";
import { format } from "date-fns";

interface GalleryCopy {
  galleryTitle?: string | null;
  gallerySubtitle?: string | null;
  galleryCTA?: string | null;
  galleryCTALink?: string | null;
}

interface GalleryPhoto {
  id: string;
  url: string;
  title?: string | null;
  createdAt?: Date | string | null;
  event?: { title: string } | null;
  project?: { title: string } | null;
}

interface Shelf {
  key: string;
  heading: string;
  eyebrow: string;
  photos: GalleryPhoto[];
}

function groupIntoShelves(photos: GalleryPhoto[]): Shelf[] {
  const shelves: Shelf[] = [];
  const byKey = new Map<string, Shelf>();
  const loose: GalleryPhoto[] = [];

  for (const photo of photos) {
    const groupTitle = photo.event?.title || photo.project?.title;
    if (!groupTitle) {
      loose.push(photo);
      continue;
    }
    const eyebrow = photo.event ? "Event" : "Initiative";
    const key = `${eyebrow}:${groupTitle}`;
    let shelf = byKey.get(key);
    if (!shelf) {
      shelf = { key, heading: groupTitle, eyebrow, photos: [] };
      byKey.set(key, shelf);
      shelves.push(shelf);
    }
    shelf.photos.push(photo);
  }

  if (loose.length > 0) {
    shelves.push({
      key: "from-the-field",
      heading: "From the field",
      eyebrow: "Everyday moments",
      photos: loose,
    });
  }

  return shelves;
}

function shelfSupport(shelf: Shelf): string | undefined {
  const dates = shelf.photos
    .map((p) => (p.createdAt ? new Date(p.createdAt) : null))
    .filter((d): d is Date => !!d && !isNaN(d.getTime()));
  if (dates.length === 0) return undefined;
  const newest = dates.reduce((a, b) => (a > b ? a : b));
  const count = shelf.photos.length;
  return `${format(newest, "MMMM yyyy")} · ${count} ${count === 1 ? "photograph" : "photographs"}`;
}

function Masonry({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
      {photos.map((photo) => {
        const label = photo.title || photo.event?.title || photo.project?.title;
        const tag = photo.event ? "Event memory" : photo.project ? "Initiative" : null;
        return (
          <figure
            key={photo.id}
            className="group relative break-inside-avoid mb-4 rounded-xl overflow-hidden bg-wash"
          >
            <Image
              src={photo.url}
              alt={label || "Club memory"}
              width={600}
              height={400}
              className="w-full h-auto object-cover thadam-grade"
            />
            {label && (
              <figcaption
                className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none bg-[rgba(24,14,4,0.55)] px-4 pt-3 pb-3.5"
              >
                <p className="text-parchment font-display font-medium text-sm leading-snug line-clamp-2">
                  {label}
                </p>
                {tag && (
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ochre mt-1">
                    {tag}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
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
      <main className="min-h-screen flex items-center justify-center bg-paper p-6">
        <EmptyState
          title="The album wouldn't open this time."
          detail="Something went wrong while loading the gallery. Please try again in a moment."
        />
      </main>
    );
  }

  const photos: GalleryPhoto[] = data.photos || [];
  const copy: GalleryCopy = data.settings || {};
  const shelves = groupIntoShelves(photos);

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* Compact hero */}
      <section className="pt-40 md:pt-48 pb-14 md:pb-20 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow className="mb-5">Gallery</Eyebrow>
            <h1 className="font-display font-medium text-ink tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
              <CmsText
                channel="gallery"
                initial={copy}
                field="galleryTitle"
                fallback="Proof we were there."
                isPreview={isPreview}
              />
            </h1>
            <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-xl">
              <CmsText
                channel="gallery"
                initial={copy}
                field="gallerySubtitle"
                fallback="Chronological snapshots of our fellowship, project drives, and installation ceremonies."
                isPreview={isPreview}
              />
            </p>
            {copy.galleryCTALink && (
              <div className="mt-8">
                <PillLink href={copy.galleryCTALink}>
                  {copy.galleryCTA || "Learn more"}
                </PillLink>
              </div>
            )}
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      {shelves.length > 0 ? (
        shelves.map((shelf, i) => (
          <section
            key={shelf.key}
            className={`py-20 md:py-28 ${i % 2 === 0 ? "bg-wash" : "bg-paper"}`}
          >
            <MaxWidthWrapper>
              <SectionHeader
                eyebrow={shelf.eyebrow}
                heading={shelf.heading}
                support={shelfSupport(shelf)}
              />
              <RevealBlock>
                <Masonry photos={shelf.photos} />
              </RevealBlock>
            </MaxWidthWrapper>
          </section>
        ))
      ) : (
        <section className="py-20 md:py-28 bg-wash">
          <MaxWidthWrapper>
            <EmptyState
              title="The camera roll is still warming up."
              detail="Photographs from our events and project drives will be shelved here as soon as they're uploaded."
            />
          </MaxWidthWrapper>
        </section>
      )}
    </main>
  );
}
