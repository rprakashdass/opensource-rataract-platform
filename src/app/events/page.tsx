import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import EventsFeed from "./_components/EventsFeed";

export const metadata: Metadata = {
  title: "Initiatives",
  openGraph: {
    description: "Explore the community service drives and fundraisers hosted by our active volunteers.",
  },
};

export default async function EventsPage() {
  let dbInitiatives: any[] = [];
  try {
    const queriedInitiatives = await prisma.initiative.findMany({
      include: {
        events: {
          orderBy: {
            startDate: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (queriedInitiatives.length > 0) {
      dbInitiatives = queriedInitiatives.map((initiative: any) => {
        const nextEvent = initiative.events.find((event: any) => new Date(event.startDate) >= new Date()) || initiative.events[0] || null;

        return {
          id: initiative.id,
          title: initiative.title,
          slug: initiative.slug,
          description: initiative.description || "",
          coverImage: initiative.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
          frequency: initiative.frequency.toLowerCase(),
          instanceCount: initiative.events.length,
          nextDate: nextEvent ? nextEvent.startDate.toISOString().split("T")[0] : initiative.startDate.toISOString().split("T")[0],
          location: nextEvent?.location || "",
        };
      });
    }
  } catch (error) {
    console.error("Prisma initiatives query failed:", error);
  }

  const events = dbInitiatives;

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Initiative Campaigns
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Our Active Initiatives
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We organize recurring service drives, leadership programs, and community campaigns. Each initiative stays as a single card and opens to all manual event instances.
            </p>
          </div>

          {/* Interactive initiatives feed */}
          <EventsFeed initialEvents={events} />
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
