import { getPublicProjects } from "@/features/public/queries/getPublicProjects";
import { PublicHero } from "@/components/ui/public/PublicHero";
import { PublicSection } from "@/components/ui/public/PublicSection";
import { PublicCard } from "@/components/ui/public/PublicCard";
import { FolderOpen } from "lucide-react";
import React from "react";

export default async function ProjectsPage() {
  const data = await getPublicProjects();

  if (data.error) {
    return <div className="p-20 text-center text-slate-500">Failed to load projects.</div>;
  }

  const activeProjects = data.activeProjects || [];
  const completedProjects = data.completedProjects || [];

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <PublicHero 
        badge="Our Initiatives"
        title="Projects & Impact"
        description="Explore the community service drives, professional development workshops, and fundraisers driven by our active volunteers."
      />

      {/* Active Projects */}
      <PublicSection title="Currently Active" background="white">
        {activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeProjects.map((project: any) => {
              const FooterData = (
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500">{project.events?.length || 0} Events</span>
                  <span className="text-primary font-bold hover:underline">Read More &rarr;</span>
                </div>
              );

              return (
                <PublicCard 
                  key={project.id}
                  title={project.title}
                  description={project.description || "No description provided."}
                  imageUrl={project.media?.[0]?.url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"}
                  href={`/projects/${project.slug}`}
                  badge="Ongoing"
                  badgeColor="success"
                  meta={project.category}
                  footer={FooterData}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No active projects at the moment.</p>
          </div>
        )}
      </PublicSection>

      {/* Completed Projects */}
      <PublicSection title="Past Endeavors" background="slate">
        {completedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completedProjects.map((project: any) => (
              <PublicCard 
                key={project.id}
                title={project.title}
                description={project.description || ""}
                imageUrl={project.media?.[0]?.url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"}
                href={`/projects/${project.slug}`}
                meta={project.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-slate-500 font-medium">No completed projects yet.</div>
        )}
      </PublicSection>
    </main>
  );
}

