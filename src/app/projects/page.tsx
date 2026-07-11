import { getPublicProjects } from "@/features/public/queries/getPublicProjects";
import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { PageHero } from "@/components/ui/public/PageHero";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { ArrowRight, Flame, Archive, Sparkles } from "lucide-react";
import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { CmsText } from "@/components/cms/CmsText";

interface ProjectsCopy {
  projectsSubtitle?: string | null;
  projectsActiveTitle?: string | null;
  projectsCompletedTitle?: string | null;
}

function ProjectsGridSkeleton() {
  return (
    <MaxWidthWrapper className="max-w-7xl mx-auto py-24 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[500px] bg-white rounded-[2rem] overflow-hidden border border-slate-100 p-6 space-y-6">
            <Skeleton className="h-[240px] w-full rounded-2xl" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isPreview = resolvedParams?.preview === "true";

  const club = await getCurrentClub();
  const settings = club ? await getOrCreateWebsiteSettings(club.id) : null;
  const heroCopy: ProjectsCopy = { projectsSubtitle: settings?.projectsSubtitle };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <PageHero
        eyebrow="Initiatives"
        title="Real impact."
        subtitle={<CmsText channel="projects" initial={heroCopy} field="projectsSubtitle" fallback="Explore our long-running community service initiatives, fundraising drives, and educational programs." isPreview={isPreview} />}
      />

      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsGrid isPreview={isPreview} />
      </Suspense>
    </main>
  );
}

async function ProjectsGrid({ isPreview }: { isPreview: boolean }) {
  const data = await getPublicProjects();

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
        <div className="text-center text-slate-500 font-medium">Failed to load projects.</div>
      </div>
    );
  }

  const activeProjects = data.activeProjects || [];
  const completedProjects = data.completedProjects || [];
  const copy: ProjectsCopy = data.settings || {};

  return (
    <>
      {/* ACTIVE INITIATIVES (RICH PREMIUM AESTHETIC) */}
      <section className="py-32 px-6 md:px-12 bg-[#FAF9F6] relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#F7A800]/5 to-transparent blur-[120px] pointer-events-none" />
        
        <MaxWidthWrapper className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#003DA5] bg-[#003DA5]/10 px-4 py-2 rounded-full inline-block mb-6">
                Currently Active
              </span>
              <h2 className="text-4xl md:text-6xl font-medium text-[#0B132B] tracking-tight">
                <CmsText channel="projects" initial={copy} field="projectsActiveTitle" fallback="Ongoing causes." isPreview={isPreview} />
              </h2>
            </div>
            <p className="text-slate-500 text-lg font-medium max-w-md md:text-right">
              Campaigns actively running in the community. Read their logs to track our progress.
            </p>
          </div>

          {activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeProjects.map((project: any) => {
                const coverImage = getGoogleDriveDirectLink(project.media?.[0]?.url) || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800";
                return (
                  <Link 
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group flex flex-col h-[550px] bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 relative"
                  >
                    <div className="h-[280px] w-full bg-slate-50 relative overflow-hidden shrink-0">
                      <Image
                        src={coverImage}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-[1.08] transition-transform duration-1000"
                      />
                      {/* Glassmorphism Badge */}
                      <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/40 text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-[#F7A800]" /> Active
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1 bg-white relative">
                      <div className="space-y-4 flex-1">
                        <span className="text-[10px] font-black text-[#F7A800] uppercase tracking-[0.15em] block">
                          {project.category.replace(/_/g, " ")}
                        </span>
                        <h3 className="text-2xl font-bold text-[#0B132B] group-hover:text-[#003DA5] transition-colors leading-tight">
                          {project.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium">
                          {project.description || "Cause details are currently under curation."}
                        </p>
                      </div>

                      <div className="pt-6 mt-auto flex items-center justify-between border-t border-slate-100/60">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {project.events?.length || 0} Phases
                        </span>
                        <span className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-[#0B132B] text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-24 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
              <Sparkles className="w-12 h-12 text-[#F7A800] mx-auto mb-6 opacity-80" />
              <h3 className="text-3xl font-medium text-[#0B132B] mb-4">Every journey starts somewhere.</h3>
              <p className="text-slate-500 font-medium text-lg">
                No active community service initiatives are currently listed. Check back soon!
              </p>
            </div>
          )}
        </MaxWidthWrapper>
      </section>

      {/* COMPLETED PROJECTS */}
      <section className="py-32 px-6 md:px-12 bg-white text-[#0B132B] border-t border-slate-200/50">
        <MaxWidthWrapper className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-12 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-100 px-4 py-2 rounded-full inline-block mb-6">
                Past Endeavors
              </span>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight">
                <CmsText channel="projects" initial={copy} field="projectsCompletedTitle" fallback="Impact archive." isPreview={isPreview} />
              </h2>
            </div>
            <p className="text-slate-500 text-lg font-medium max-w-md md:text-right">
              Explore the legacy of our completed projects and the lives they've touched.
            </p>
          </div>

          {completedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedProjects.map((project: any) => {
                const coverImage = getGoogleDriveDirectLink(project.media?.[0]?.url) || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800";
                return (
                  <Link 
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group flex flex-col h-[500px] bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 relative"
                  >
                    <div className="h-[240px] w-full bg-slate-200 relative overflow-hidden shrink-0">
                      <Image
                        src={coverImage}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-60 group-hover:scale-[1.08] group-hover:opacity-90 transition-all duration-1000 mix-blend-luminosity group-hover:mix-blend-normal"
                      />
                      <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm">
                        <Archive className="w-3.5 h-3.5" /> Completed
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="space-y-4 flex-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block">
                          {project.category.replace(/_/g, " ")}
                        </span>
                        <h3 className="text-2xl font-bold text-[#0B132B] group-hover:text-[#003DA5] transition-colors leading-tight">
                          {project.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium">
                          {project.description || "A completed community operations drive."}
                        </p>
                      </div>

                      <div className="pt-6 mt-auto flex items-center justify-between border-t border-slate-200">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {project.events?.length || 0} Archives
                        </span>
                        <span className="w-10 h-10 rounded-full bg-white group-hover:bg-[#0B132B] text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-200 group-hover:border-transparent">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-400 font-medium text-center py-20 text-lg">
              No completed projects archived yet.
            </div>
          )}
        </MaxWidthWrapper>
      </section>
    </>
  );
}
