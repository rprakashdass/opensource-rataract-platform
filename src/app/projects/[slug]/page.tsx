import { getPublicProject } from "@/features/public/queries/getPublicProject";
import { Metadata } from "next";
import Image from "next/image";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight, Camera, Users, Clock, Target, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/ui/member-avatar";

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

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-32">
      {/* Light editorial hero */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-white border-b border-slate-200/50">
        {/* Subtle background gradients */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <div className="space-y-6">
              <div className="flex gap-2">
                <Badge className="bg-primary/15 text-primary border-none px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                  {project.category.replace(/_/g, " ")}
                </Badge>
                {project.status === "COMPLETED" ? (
                  <Badge className="bg-slate-100 text-slate-600 border-none px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                    Completed Journey
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-none px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                    Active Cause
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0B132B] tracking-tight leading-[1.15]">
                {project.title}
              </h1>
              {project.startDate && (
                <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-primary" />
                  <span>Initiated {new Date(project.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </p>
              )}
            </div>

            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 bg-slate-50">
              <Image
                src={coverImage}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover animate-in fade-in duration-500"
              />
            </div>
            
          </div>
        </MaxWidthWrapper>
      </section>

      <MaxWidthWrapper className="mt-16 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Context Area */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* The Purpose / Cause description */}
            <section className="bg-white border border-slate-200/60 p-8 md:p-10 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-black text-[#0B132B] mb-6 flex items-center gap-2.5">
                <Target className="w-6 h-6 text-primary" />
                Why We Started
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium text-sm md:text-base">
                {project.description ? (
                  <p className="whitespace-pre-wrap">{project.description}</p>
                ) : (
                  <p className="italic text-slate-400 font-semibold">Initiative parameters are currently being documented by committee delegates.</p>
                )}
              </div>
            </section>

            {/* Cumulative Impact snapshot metrics */}
            {totalVolunteerHours > 0 && (
              <section className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm">
                <h2 className="text-lg font-black text-[#0B132B] mb-6 uppercase tracking-wider border-b border-slate-100 pb-3">Cumulative Cause Impact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Volunteer Hours Allocated</p>
                    <p className="text-4xl font-black text-[#0B132B]">{totalVolunteerHours} hours</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Action Phases Completed</p>
                    <p className="text-4xl font-black text-[#0B132B]">{projectAny.events?.length || 0} phases</p>
                  </div>
                </div>
              </section>
            )}

            {/* Project action phases (Timeline of children events) */}
            {projectAny.events && projectAny.events.length > 0 && (
              <section className="space-y-10">
                <h2 className="text-2xl font-black text-[#0B132B]">Action Phases</h2>
                <div className="space-y-8 relative before:absolute before:inset-0 before:left-[15px] before:w-0.5 before:bg-slate-200">
                  {projectAny.events.map((event: any) => {
                    const eventDate = new Date(event.startDate);
                    
                    return (
                      <div key={event.id} className="relative pl-8">
                        {/* Timeline Bullet Node */}
                        <div className="absolute left-[7px] top-2 flex items-center justify-center w-[18px] h-[18px] rounded-full border-4 border-[#FAF9F6] bg-primary shadow-sm" />
                        
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm flex flex-col justify-between gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                {eventDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                              <h3 className="text-lg font-black text-[#0B132B]">{event.title}</h3>
                            </div>
                            <Link href={`/events/${event.slug}`}>
                              <Button size="sm" variant="outline" className="rounded-full text-xs font-bold border-slate-300">
                                View phase details
                              </Button>
                            </Link>
                          </div>
                          
                          {event.description && (
                            <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-2">{event.description}</p>
                          )}
                          
                          {event.volunteerHours && (
                            <div className="pt-4 border-t border-slate-100 flex gap-6 text-xs text-slate-500 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {event.volunteerHours} volunteer hours</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Cause Gallery Archive */}
            {gallery.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-[#0B132B] flex items-center gap-2.5">
                  <Camera className="w-6 h-6 text-primary" />
                  Initiative Moments
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.slice(0, 6).map((m: any) => (
                    <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200/30 relative group shadow-sm">
                      <Image
                        src={m.url}
                        alt="Project activity"
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Organizing Team Checklist */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm space-y-6">
              <h3 className="font-black text-[#0B132B] text-lg uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Organizing Team
              </h3>
              
              {projectAny.members && projectAny.members.length > 0 ? (
                <div className="space-y-4">
                  {projectAny.members.map((pm: any) => (
                    <div key={pm.id || pm.member?.id || Math.random().toString()} className="flex items-center gap-3.5 p-3 bg-[#FAF9F6] rounded-xl border border-slate-200/40">
                      <MemberAvatar
                        name={pm.member.name}
                        avatarUrl={pm.member.avatar}
                        className="w-10 h-10 border border-slate-200/60 rounded-full"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-800 leading-tight">{pm.member.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{pm.role.replace("_", " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FAF9F6] rounded-xl p-6 text-center border border-dashed border-slate-200/60">
                  <HelpCircle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-semibold">Organizers are currently being structured.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </MaxWidthWrapper>
    </main>
  );
}
