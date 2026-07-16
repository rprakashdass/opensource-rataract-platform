import { getPublicGalleryPhotos } from "@/features/public/queries/getPublicGalleryPhotos";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import Image from "next/image";
import { CmsText } from "@/components/cms/CmsText";
import {
  RevealBlock,
  PageIntro,
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

function Masonry({ photos, eagerCount = 0 }: { photos: GalleryPhoto[]; eagerCount?: number }) {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
      {photos.map((photo, photoIndex) => {
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
              priority={photoIndex < eagerCount}
              className="w-full h-auto object-cover thadam-grade"
            />
            {label && (
              <figcaption
                className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none bg-[rgba(26,10,18,0.55)] px-4 pt-3 pb-3.5"
              >
                <p className="text-parchment font-display font-medium text-sm leading-snug line-clamp-2">
                  {label}
                </p>
                {tag && (
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand mt-1">
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
      <PageIntro
        eyebrow="Gallery"
        title={
          <CmsText
            channel="gallery"
            initial={copy}
            field="galleryTitle"
            fallback="Proof we were there."
            isPreview={isPreview}
          />
        }
        support={
          <CmsText
            channel="gallery"
            initial={copy}
            field="gallerySubtitle"
            fallback="Chronological snapshots of our fellowship, project drives, and installation ceremonies."
            isPreview={isPreview}
          />
        }
      >
        {copy.galleryCTALink && (
          <div className="mt-6">
            <PillLink href={copy.galleryCTALink}>
              {copy.galleryCTA || "Learn more"}
            </PillLink>
          </div>
        )}
      </PageIntro>

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
                {/* First shelf's opening images sit above the fold — eager-load them (LCP) */}
                <Masonry photos={shelf.photos} eagerCount={i === 0 ? 4 : 0} />
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
