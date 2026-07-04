import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

export default function BoardPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Club Leadership
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Board Members
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Meet our active board of directors and committee coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg border border-primary/10 p-6 text-center">
                <div className="w-24 h-24 bg-primary/5 rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Board Member {i}</h3>
                <p className="text-muted-foreground mt-2">Position</p>
              </div>
            ))}
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Board member profiles integrated in Team page directory.</p>
          </div>
        </div>
      </MaxWidthWrapper>
    </main>
  );
}
