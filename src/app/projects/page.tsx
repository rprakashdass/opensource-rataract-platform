export const revalidate = 300;
import { getPublicProjects } from "@/features/public/queries/getPublicProjects";
import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CmsText } from "@/components/cms/CmsText";
import { draftMode } from "next/headers";
import {
  RevealBlock,
  Eyebrow,
  PageIntro,
  SectionLabel,
  EditorialImage,
  StoryCard,
  TrailRule,
  ListRow,
  InvitePanel,
  EmptyState,
  QuietLink,
} from "@/components/ui/public/v2";

interface ProjectsCopy {
  projectsSubtitle?: string | null;
  projectsActiveTitle?: string | null;
  projectsCompletedTitle?: string | null;
}

function formatCategory(category: string) {
  return category.replace(/_/g, " ").toLowerCase();
}

function ProjectsGridSkeleton() {
  return (
    <MaxWidthWrapper className="py-20 md:py-28 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8">
        <Skeleton className="lg:col-span-7 aspect-[3/2] w-full rounded-xl bg-wash" />
        <div className="lg:col-span-4 lg:col-start-9 space-y-4 self-center">
          <Skeleton className="h-4 w-24 bg-wash" />
          <Skeleton className="h-8 w-3/4 bg-wash" />
          <Skeleton className="h-16 w-full bg-wash" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[4/5] w-full rounded-xl bg-wash" />
            <Skeleton className="h-6 w-2/3 bg-wash" />
            <Skeleton className="h-4 w-full bg-wash" />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}

export default async function ProjectsPage() {
  const draft = await draftMode();
  const isPreview = draft.isEnabled;

  const club = await getCurrentClub();
  const settings = club ? await getOrCreateWebsiteSettings(club.id) : null;
  const heroCopy: ProjectsCopy = { projectsSubtitle: settings?.projectsSubtitle };

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageIntro
        eyebrow="Our work"
        title={<>Work that outlasts the photos.</>}
        support={
          <CmsText
            channel="projects"
            initial={heroCopy}
            field="projectsSubtitle"
            fallback="Explore our long-running community service initiatives, fundraising drives, and educational programs."
            isPreview={isPreview}
          />
        }
      />

      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsGrid isPreview={isPreview} />
      </Suspense>
    </main>
  );
}

async function ProjectsGrid({ isPreview }: { isPreview: boolean }) {
  const data = await getPublicProjects();

  if ("error" in data && data.error) {
    return (
      <section className="py-24 bg-paper">
        <MaxWidthWrapper>
          <EmptyState
            title="The project index wandered off the trail."
            detail="We couldn't load our projects right now. Please try again in a moment."
          />
        </MaxWidthWrapper>
      </section>
    );
  }

  const projectsData = data as any;
  const activeProjects: any[] = projectsData.activeProjects || [];
  const completedProjects: any[] = projectsData.completedProjects || [];
  const copy: ProjectsCopy = projectsData.settings || {};

  const flagship = activeProjects[0];
  const restActive = activeProjects.slice(1);

  return (
    <>
      {/* ACTIVE PROJECTS */}
      <section className="py-20 md:py-28 bg-wash">
        <MaxWidthWrapper>
          <RevealBlock>
            <SectionLabel>
              <CmsText
                channel="projects"
                initial={copy}
                field="projectsActiveTitle"
                fallback="Ongoing causes."
                isPreview={isPreview}
              />
            </SectionLabel>
          </RevealBlock>

          {flagship ? (
            <>
              {/* Flagship feature */}
              <RevealBlock>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8 items-center">
                  <EditorialImage
                    src={flagship.media?.[0]?.url}
                    alt={flagship.title}
                    ratio="3/2"
                    fallbackText={flagship.title}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="lg:col-span-7"
                  />
                  <div className="lg:col-span-4 lg:col-start-9">
                    <Eyebrow className="mb-4">{formatCategory(flagship.category)}</Eyebrow>
                    <h3 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.12] text-[clamp(1.7rem,3.5vw,2.6rem)] text-balance">
                      {flagship.title}
                    </h3>
                    {flagship.description && (
                      <p className="mt-4 text-[15px] text-ink-soft leading-relaxed line-clamp-4">
                        {flagship.description}
                      </p>
                    )}
                    <div className="mt-7">
                      <QuietLink href={`/projects/${flagship.slug}`}>Read the story</QuietLink>
                    </div>
                  </div>
                </div>
              </RevealBlock>

              {/* Remaining active projects */}
              {restActive.length > 0 && (
                <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                  {restActive.map((project: any) => (
                    <RevealBlock key={project.id}>
                      <StoryCard
                        href={`/projects/${project.slug}`}
                        imageUrl={project.media?.[0]?.url}
                        eyebrow={formatCategory(project.category)}
                        title={project.title}
                        outcome={project.description}
                        caption={
                          project.events?.length
                            ? `${project.events.length} action ${project.events.length === 1 ? "phase" : "phases"}`
                            : null
                        }
                      />
                    </RevealBlock>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="The next project is still on the drawing board."
              detail="No active initiatives are listed right now — new work is being planned. Check back soon."
            />
          )}
        </MaxWidthWrapper>
      </section>

      {/* COMPLETED PROJECTS INDEX */}
      <section className="py-20 md:py-28 bg-paper">
        <MaxWidthWrapper>
          <TrailRule className="mb-16 md:mb-20" />
          <RevealBlock>
            <SectionLabel>
              <CmsText
                channel="projects"
                initial={copy}
                field="projectsCompletedTitle"
                fallback="Impact archive."
                isPreview={isPreview}
              />
            </SectionLabel>
          </RevealBlock>

          {completedProjects.length > 0 ? (
            <RevealBlock>
              <div className="border-t border-hairline">
                {completedProjects.map((project: any) => (
                  <ListRow
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    date={project.endDate}
                    title={project.title}
                    meta={[
                      project.endDate
                        ? `Completed ${new Date(project.endDate).getFullYear()}`
                        : null,
                      formatCategory(project.category),
                      project.events?.length
                        ? `${project.events.length} action ${project.events.length === 1 ? "phase" : "phases"}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                ))}
              </div>
            </RevealBlock>
          ) : (
            <EmptyState
              title="The archive is waiting for its first entry."
              detail="Completed projects will be indexed here once our current work wraps up."
            />
          )}
        </MaxWidthWrapper>
      </section>

      <InvitePanel
        statement="Every project needs more hands."
        primaryText="Join the club"
        primaryHref="/join"
        secondaryText="Partner with us"
        secondaryHref="/partner"
      />
    </>
  );
}
