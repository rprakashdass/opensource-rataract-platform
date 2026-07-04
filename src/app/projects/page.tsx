import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Our Initiatives
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Our Projects
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore the community service drives and fundraisers hosted by our active volunteers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-lg border border-primary/10 overflow-hidden hover:shadow-lg transition">
                <div className="w-full h-40 bg-primary/5" />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground">Project {i}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">Making an impact in our community</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Projects list coming soon in Sprint 2 with CMS integration.</p>
          </div>
        </div>
      </MaxWidthWrapper>
    </main>
  );
}
