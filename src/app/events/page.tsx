import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import EventsFeed from "./_components/EventsFeed";

export const metadata: Metadata = {
  title: "Events & Initiatives",
  openGraph: {
    description: "Explore the community service drives, fundraisers, and events hosted by our active volunteers.",
  },
};

export default async function EventsPage() {
  let dbInitiatives: any[] = [];
  try {
    const queriedEvents = await prisma.event.findMany({
      orderBy: {
        startDate: "asc",
      },
    });

    if (queriedEvents.length > 0) {
      dbInitiatives = queriedEvents.map((event: any) => {
        return {
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description || "",
          coverImage: event.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
          frequency: "once",
          instanceCount: 1,
          nextDate: event.startDate.toISOString().split("T")[0],
          location: event.location || "",
        };
      });
    }
  } catch (error) {
    console.error("Prisma events query failed:", error);
  }

  const events = dbInitiatives;

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Events & Campaigns
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Our Active Events & Initiatives
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We organize recurring service drives, leadership programs, and standalone community events. Explore them all below!
            </p>
          </div>

          {/* Interactive initiatives feed */}
          <EventsFeed initialEvents={events} />
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
