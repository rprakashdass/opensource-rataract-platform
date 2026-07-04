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
  let dbEvents: any[] = [];
  try {
    const queriedEvents = await prisma.event.findMany({
      orderBy: {
        startDate: "desc",
      },
    });

    if (queriedEvents.length > 0) {
      dbEvents = queriedEvents.map((e: any) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        description: e.description || "",
        date: e.startDate.toISOString().split("T")[0],
        location: e.location || "",
        coverImage: e.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
      }));
    }
  } catch (error) {
    console.error("Prisma events query failed:", error);
  }

  const events = dbEvents;

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Event Campaigns
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Our Active Initiatives
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We organize fundraising campaigns, local cleanliness drives, and professional leadership conferences throughout the year. Connect with us to participate.
            </p>
          </div>

          {/* Interactive events feed */}
          <EventsFeed initialEvents={events} />
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
