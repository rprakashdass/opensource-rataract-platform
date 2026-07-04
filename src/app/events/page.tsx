import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { currentYear } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import EventsFeed from "./_components/EventsFeed";

export const metadata: Metadata = {
  title: "Initiatives",
  openGraph: {
    description: "Explore the community service drives and fundraisers hosted by our active volunteers.",
  },
};

const mockEvents = [
  {
    id: "e1",
    title: "Sustainability Hackathon",
    slug: "sustainability-hackathon",
    description: "A collaborative 48-hour technological build event focused on constructing open-source solutions for climate control, waste management, and solar integrations.",
    date: "2026-07-12",
    location: "Online / Discord Platform",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "e2",
    title: "Clean Water Campaign",
    slug: "clean-water-project",
    description: "Community-driven fundraising and volunteer operations establishing water filtration kits for rural schools and educational hubs.",
    date: "2026-08-05",
    location: "Rural Public Schools",
    coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "e3",
    title: "Support Education Drive",
    slug: "education-drive",
    description: "Gathering and distributing textbooks, stationery, and laptops to children in shelter homes to encourage digital literacy.",
    date: "2026-06-25",
    location: "Metro Shelter Homes",
    coverImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800"
  }
];

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
    console.warn("Prisma events query failed, using mock fallback:", error);
  }

  const events = dbEvents.length > 0 ? dbEvents : mockEvents;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
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
