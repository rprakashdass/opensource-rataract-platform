import { getHomeBaseData, getHomeImpact, getHomeNews } from "@/features/public/queries/getHomeData";
import { getPublicProjects } from "@/features/public/queries/getPublicProjects";
import { getPublicEvents } from "@/features/public/queries/getPublicEvents";
import { getPublicTeam } from "@/features/public/queries/getPublicTeam";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Award, Megaphone, Heart } from "lucide-react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { Hero } from "@/components/ui/public/Hero";
import { ImpactStats } from "@/components/ui/public/ImpactStats";
import { AvenuesOfService } from "@/components/ui/public/AvenuesOfService";
import { PublicSection } from "@/components/ui/public/PublicSection";
import { PublicCard } from "@/components/ui/public/PublicCard";
import { Timeline } from "@/components/ui/public/Timeline";
import { GalleryGrid } from "@/components/ui/public/GalleryGrid";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

function SectionSkeleton() {
  return (
    <MaxWidthWrapper className="py-12">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </MaxWidthWrapper>
  );
}

export default async function HomePage() {
  const data = await getHomeBaseData();
  
  if (data?.error === "Club not initialized" || !data?.club) {
    redirect("/setup");
  }

  const { club, settings } = data;

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {settings.enableHero !== false && (
        <Hero 
          clubName={settings.heroHeadline || club.name} 
          missionStatement={settings.heroSubtitle || club.missionStatement} 
          tenureYear={club.tenureYear} 
          ctaText={settings.heroCTA}
        />
      )}

      {settings.enableImpact !== false && (
        <Suspense fallback={<SectionSkeleton />}>
          <ImpactSection clubId={club.id} />
        </Suspense>
      )}

      <AvenuesOfService />

      {settings.enableFeaturedProjects !== false && (
        <Suspense fallback={<SectionSkeleton />}>
          <InitiativesSection />
        </Suspense>
      )}

      {(settings.enableEvents !== false || settings.enableAnnouncements !== false) && (
        <section className="py-24 bg-slate-50">
          <MaxWidthWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              {settings.enableEvents !== false && (
                <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
                  <EventsSection />
                </Suspense>
              )}

              {settings.enableAnnouncements !== false && (
                <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
                  <NewsSection clubId={club.id} />
                </Suspense>
              )}
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      {settings.enableGallery !== false && (
        <Suspense fallback={<SectionSkeleton />}>
          <GalleryPreviewSection />
        </Suspense>
      )}

      {settings.enableLeadership !== false && (
        <Suspense fallback={<SectionSkeleton />}>
          <LeadershipSection tenureYear={club.tenureYear} />
        </Suspense>
      )}

      {/* Big Join CTA */}
      <section className="py-32 bg-amber-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />
        <MaxWidthWrapper className="relative z-10 text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">Ready to make a difference?</h2>
          <p className="text-xl md:text-2xl text-amber-100 mb-12 font-medium">Join a global network of young leaders working together to tackle the world's most pressing challenges.</p>
          <Link href="/join">
            <Button className="rounded-full bg-white text-amber-600 hover:bg-amber-50 px-12 h-16 text-xl font-black shadow-xl shadow-amber-900/10 hover:-translate-y-1 transition-all duration-300">
              <Heart className="w-6 h-6 mr-3" /> Become a Member Today
            </Button>
          </Link>
        </MaxWidthWrapper>
      </section>

    </main>
  );
}

// -------------------------------------------------------------
// Component Sections
// -------------------------------------------------------------

async function ImpactSection({ clubId }: { clubId: string }) {
  const impact = await getHomeImpact(clubId);
  return (
    <ImpactStats 
      members={impact.members} 
      projects={impact.projects} 
      hours={impact.hours} 
      events={impact.events} 
    />
  );
}

async function InitiativesSection() {
  const projectsData = await getPublicProjects();
  if (projectsData.error) return null;
  
  const featuredProjects = (projectsData.activeProjects || []).slice(0, 3);
  
  return (
    <PublicSection 
      title="Our Initiatives"
      description="We believe in grassroots impact. Discover the long-running projects and community service initiatives driven by our members."
      background="white"
    >
      {featuredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.map((project: any) => (
            <PublicCard
              key={project.id}
              title={project.title}
              description={project.description || ""}
              imageUrl={project.media?.[0]?.url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"}
              href={`/projects/${project.slug}`}
              badge="Ongoing"
              badgeColor="success"
              meta={project.category}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl p-16 text-center border border-slate-100">
          <Award className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">More Projects Coming Soon</h3>
          <p className="text-slate-500 max-w-md mx-auto">Our club is currently planning our next major initiatives. Stay tuned!</p>
        </div>
      )}
      
      <div className="mt-10 text-center">
        <Link href="/projects">
          <Button variant="outline" className="rounded-full border-slate-300 py-6 px-8">View All Initiatives</Button>
        </Link>
      </div>
    </PublicSection>
  );
}

async function EventsSection() {
  const eventsData = await getPublicEvents();
  if (eventsData.error) return null;
  const upcomingEvents = eventsData.upcomingEvents?.slice(0, 3) || [];

  return (
    <div>
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Calendar</h2>
        <Link href="/events" className="text-primary font-bold items-center hover:underline text-sm hidden sm:flex">
          All Events <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <Timeline events={upcomingEvents} />
    </div>
  );
}

async function NewsSection({ clubId }: { clubId: string }) {
  const latestUpdates = await getHomeNews(clubId);
  return (
    <div>
      <div className="flex justify-between items-end mb-10">
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Club News</h2>
      <Link href="/announcements" className="text-primary font-bold items-center hover:underline text-sm hidden sm:flex">
        Noticeboard <ChevronRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
    
    <div className="space-y-6">
      {latestUpdates.length > 0 ? (
        latestUpdates.map((update: any) => (
          <Link href={`/announcements`} key={update.id} className="block group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{new Date(update.createdAt).toLocaleDateString()}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2 line-clamp-1">{update.title}</h3>
            {update.description && (
              <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed">{update.description}</p>
            )}
          </Link>
        ))
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No recent club news.</p>
        </div>
      )}
    </div>
  </div>
  );
}

async function GalleryPreviewSection() {
  const projectsData = await getPublicProjects();
  const eventsData = await getPublicEvents();
  
  if (projectsData.error || eventsData.error) return null;
  
  const recentGallery = [...(projectsData.activeProjects || []), ...(eventsData.upcomingEvents || [])]
    .flatMap((item: any) => item.media || [])
    .filter((m: any) => m.usage === "GALLERY" || m.isCover || true) // Simplified for now since media schema might be different
    .slice(0, 5);

  if (recentGallery.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <MaxWidthWrapper>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Recent Memories</h2>
          <p className="text-slate-500 font-medium text-lg">A glimpse into our community events, projects, and everyday fellowships.</p>
        </div>
        <GalleryGrid items={recentGallery} />
        <div className="mt-12 text-center">
          <Link href="/gallery">
            <Button variant="outline" className="rounded-full border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-8 py-6">
              View Full Gallery
            </Button>
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}

async function LeadershipSection({ tenureYear }: { tenureYear: string }) {
  const teamData = await getPublicTeam();
  if (teamData.error) return null;
  const leadership = teamData.board?.slice(0, 4) || [];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <MaxWidthWrapper className="relative z-10">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Meet The Team</h2>
          <p className="text-slate-500 font-medium text-lg">Driven by passion, guided by Rotary values. Meet the Rotaractors leading the charge for the {tenureYear} tenure.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-12 lg:gap-16">
          {leadership.length > 0 ? leadership.map((leader: any) => (
            <div key={leader.id} className="text-center group cursor-default">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden mb-6 bg-slate-200 shadow-lg group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 relative">
                <Image src={leader.member.avatar || "/user.png"} alt={leader.member.name} fill sizes="(max-width: 768px) 128px, 160px" className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{leader.member.name}</h3>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-xs mt-2 bg-white px-3 py-1 rounded-full inline-block border border-slate-100">{leader.position.replace(/_/g, " ")}</p>
            </div>
          )) : (
            <div className="text-slate-500 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm w-full max-w-lg text-center">Leadership board has not been formed yet.</div>
          )}
        </div>
        
        <div className="mt-20 text-center">
          <Link href="/team">
            <Button variant="outline" className="rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-10 h-14 text-base font-bold shadow-sm">
              View Full Members Directory
            </Button>
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
