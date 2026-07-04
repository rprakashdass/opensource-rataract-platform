import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Visual Moments
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Gallery
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore media captures and moments from our active events and service drives.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-primary/5 border border-primary/10 rounded-xl hover:opacity-75 transition cursor-pointer" />
            ))}
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Gallery with image management coming soon in Sprint 2.</p>
          </div>
        </div>
      </MaxWidthWrapper>
    </main>
  );
}
