import { getPublicProject } from "@/features/public/queries/getPublicProject";
import { Metadata } from "next";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, UserCircle, MapPin, ArrowRight, Camera, Users, Clock, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getPublicProject(resolvedParams.slug);

  if (data.error || !data.project) {
    return { title: "Project Not Found" };
  }

  const { project } = data;
  const title = `${project.title} | Rotaract Club`;
  const description = project.description ? project.description.substring(0, 160) : `Check out ${project.title}`;
  const projectAny = project as any;
  const imageUrl = projectAny.media?.[0]?.url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1600";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getPublicProject(resolvedParams.slug);

  if (data.error || !data.project) {
    notFound();
  }

  const { project } = data;
  const projectAny = project as any;
  const coverImage = projectAny.media?.[0]?.url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1600";
  const gallery = projectAny.media || [];

  // Calculate cumulative impact from child events
  const totalVolunteerHours = projectAny.events?.reduce((acc: number, curr: any) => acc + (curr.volunteerHours || 0), 0) || 0;
  const totalFundsRaised = projectAny.events?.reduce((acc: number, curr: any) => acc + (curr.fundsRaised || 0), 0) || 0;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-32">
      {/* Premium Light Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white border-b border-slate-100">
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <div className="space-y-6">
              <div className="flex gap-2">
                <Badge className="bg-amber-100 text-amber-800 border-none px-3 py-1 rounded-full shadow-sm">{project.category}</Badge>
                {project.status === "COMPLETED" ? (
                  <Badge className="bg-slate-100 text-slate-700 border-none px-3 py-1 rounded-full shadow-sm">Completed</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-800 border-none px-3 py-1 rounded-full shadow-sm">Active Initiative</Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                {project.title}
              </h1>
              {project.startDate && (
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Initiated {new Date(project.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50">
              <img 
                src={coverImage} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            
          </div>
        </MaxWidthWrapper>
      </section>

      <MaxWidthWrapper className="mt-16 md:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Main Story Content */}
          <div className="lg:col-span-2 space-y-20">
            
            {/* The Purpose / Story */}
            <section>
              <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Target className="w-8 h-8 text-amber-500" />
                The Purpose
              </h2>
              <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                {project.description ? (
                  <p className="whitespace-pre-wrap">{project.description}</p>
                ) : (
                  <p className="italic text-slate-400">Project purpose is currently being documented.</p>
                )}
              </div>
            </section>

            {/* Overall Impact */}
            {(totalVolunteerHours > 0 || totalFundsRaised > 0) && (
              <section className="bg-amber-50 rounded-3xl p-8 md:p-12 border border-amber-100">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Cumulative Impact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {totalVolunteerHours > 0 && (
                    <div>
                      <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">Volunteer Hours</p>
                      <p className="text-5xl font-black text-slate-900">{totalVolunteerHours}</p>
                    </div>
                  )}
                  {totalFundsRaised > 0 && (
                    <div>
                      <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Funds Raised</p>
                      <p className="text-5xl font-black text-slate-900">${totalFundsRaised}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Project Instances (Child Events) */}
            {projectAny.events && projectAny.events.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-slate-900 mb-10">Initiative Instances</h2>
                <div className="space-y-16">
                  {projectAny.events.map((event: any) => {
                    const eventDate = new Date(event.startDate);
                    const eventGallery = event.media?.filter((m: any) => m.usage === "GALLERY") || [];
                    
                    return (
                      <div key={event.id} className="relative pl-6 md:pl-10 border-l-2 border-slate-200">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[11px] top-2 w-5 h-5 rounded-full border-4 border-[#FAFAFA] bg-amber-500 shadow-sm" />
                        
                        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                            <div>
                              <p className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">{eventDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                              <h3 className="text-2xl font-black text-slate-900">{event.title}</h3>
                            </div>
                            <Link href={`/events/${event.slug}`}>
                              <Button variant="outline" size="sm" className="rounded-full shadow-sm">View Full Event</Button>
                            </Link>
                          </div>
                          
                          {event.description && (
                            <p className="text-slate-600 mb-8 font-medium">{event.description}</p>
                          )}
                          
                          {/* Instance Impact */}
                          {(event.volunteerHours || event.fundsRaised) && (
                            <div className="flex gap-8 mb-8 pt-6 border-t border-slate-100">
                              {event.volunteerHours && (
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours</p>
                                  <p className="text-2xl font-black text-slate-900">{event.volunteerHours}</p>
                                </div>
                              )}
                              {event.fundsRaised && (
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raised</p>
                                  <p className="text-2xl font-black text-emerald-600">${event.fundsRaised}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Instance Photos */}
                          {eventGallery.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {eventGallery.slice(0, 4).map((m: any) => (
                                <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                                  <img src={m.url} alt="Instance photo" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Dedicated Project Gallery */}
            {gallery.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <Camera className="w-8 h-8 text-amber-500" />
                    Project Gallery
                  </h2>
                  <Link href="/gallery" className="text-amber-600 font-bold hover:underline text-sm">
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.slice(0, 6).map((m: any) => (
                    <div key={m.id} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm group">
                      <img 
                        src={m.url} 
                        alt="Project activity"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Volunteers Involved */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
              <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-amber-500" /> Organizing Volunteers
              </h3>
              
              {projectAny.members && projectAny.members.length > 0 ? (
                <div className="space-y-4">
                  {projectAny.members.map((pm: any) => (
                    <div key={pm.id} className="flex items-center gap-4">
                      <img 
                        src={pm.member.avatar || "/user.png"} 
                        alt={pm.member.name}
                        className="w-12 h-12 rounded-full bg-slate-100 object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{pm.member.name}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{pm.role.replace("_", " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm font-medium">Volunteers have not been assigned yet.</p>
              )}
            </div>

          </div>

        </div>
      </MaxWidthWrapper>
    </main>
  );
}
