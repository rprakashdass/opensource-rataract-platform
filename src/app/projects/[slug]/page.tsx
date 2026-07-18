export const revalidate = 300;
import { getPublicProject } from "@/features/public/queries/getPublicProject";
import { getProjectUpdatesPage, getProjectUpdatesImpact } from "@/features/public/actions/getProjectUpdates";
import { Metadata } from "next";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { notFound } from "next/navigation";
import {
  RevealBlock,
  Eyebrow,
  EditorialImage,
  PersonCard,
  ImpactBand,
  TimelineRow,
  InvitePanel,
  EmptyState,
  QuietLink,
} from "@/components/ui/public/v2";
import ProjectUpdatesTimeline from "./_components/ProjectUpdatesTimeline";

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
  const imageUrl = projectAny.media?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

function formatCategory(category: string) {
  return category.replace(/_/g, " ").toLowerCase();
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getPublicProject(resolvedParams.slug);

  if (data.error || !data.project) {
    notFound();
  }

  const { project } = data;
  const projectAny = project as any;
  const coverImage = projectAny.media?.[0]?.url || null;
  const gallery = projectAny.media || [];
  const moments = gallery.slice(1, 4);

  // Fetch first page of updates server-side (ISR-cached)
  const [updatesData, updatesImpact] = await Promise.all([
    getProjectUpdatesPage(project.id, 1),
    getProjectUpdatesImpact(project.id)
  ]);

  // Calculate cumulative impact from events + updates
  const totalVolunteerHoursFromEvents = projectAny.events?.reduce((acc: number, curr: any) => acc + (curr.volunteerHours || 0), 0) || 0;
  const totalVolunteerHours = totalVolunteerHoursFromEvents + (updatesImpact.volunteerHours || 0);
  const totalBeneficiaries = updatesImpact.beneficiaries || 0;

  const members = projectAny.members || [];
  const events = projectAny.events || [];

  const startLabel = project.startDate
    ? new Date(project.startDate).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;
  const endLabel = project.endDate
    ? new Date(project.endDate).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  const metaParts = [
    startLabel ? (endLabel ? `${startLabel} — ${endLabel}` : `Since ${startLabel}`) : null,
    members.length > 0 ? `${members.length} ${members.length === 1 ? "organizer" : "organizers"}` : null,
    totalVolunteerHours > 0 ? `${totalVolunteerHours} volunteer hours` : null,
  ].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-paper">
      {/* Title block + editorial hero image */}
      <section className="pt-40 md:pt-48 pb-14 md:pb-16 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow className="mb-5">
              {formatCategory(project.category)} · {project.status === "COMPLETED" ? "completed" : "active"}
            </Eyebrow>
            <h1 className="font-display font-medium text-ink tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-4xl">
              {project.title}
            </h1>
            {metaParts.length > 0 && (
              <p className="mt-6 text-sm font-medium text-ink-faint">
                {metaParts.join(" · ")}
              </p>
            )}
          </RevealBlock>

          <div className="mt-12 md:mt-16">
            <EditorialImage
              src={coverImage}
              alt={project.title}
              ratio="21/9"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              fallbackText={project.title}
              caption={startLabel ? `${project.title} — ${startLabel}` : null}
            />
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Narrative + organizing team */}
      <section className="py-20 md:py-28 bg-wash">
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-16 items-start">
            <RevealBlock className="lg:col-span-8">
              <Eyebrow className="mb-4">Why we started</Eyebrow>
              {project.description ? (
                <p className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.35] text-[clamp(1.2rem,2.2vw,1.6rem)] whitespace-pre-wrap max-w-2xl">
                  {project.description}
                </p>
              ) : (
                <p className="font-display font-medium italic text-ink-soft text-xl max-w-2xl">
                  The story behind this project is still being written down.
                </p>
              )}
            </RevealBlock>

            <RevealBlock className="lg:col-span-4 lg:col-start-9">
              <Eyebrow className="mb-6">Organizing team</Eyebrow>
              {members.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-5 gap-y-8">
                  {members.map((pm: any, i: number) => (
                    <PersonCard
                      key={`${pm.member?.name}-${i}`}
                      name={pm.member.name}
                      role={pm.role.replace(/_/g, " ").toLowerCase()}
                      photoUrl={pm.member.avatar}
                      compact
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="The organizing circle is still forming."
                  detail="Team members will appear here once roles are confirmed."
                  className="py-6 text-left mx-0"
                />
              )}
            </RevealBlock>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Cumulative impact */}
      {(totalVolunteerHours > 0 || totalBeneficiaries > 0) && (
        <ImpactBand
          kicker="The marks this project left"
          condensed
          metrics={[
            ...(totalVolunteerHours > 0 ? [{ value: totalVolunteerHours, label: "Volunteer hours" }] : []),
            ...(totalBeneficiaries > 0 ? [{ value: totalBeneficiaries, label: "Lives touched" }] : []),
            ...(updatesData.totalCount > 0 ? [{ value: updatesData.totalCount, label: "Days of action" }] : []),
            ...(events.length > 0 ? [{ value: events.length, label: "Action phases" }] : []),
          ]}
          provenance="Tallied from this project's updates and completed phases."
        />
      )}

      {/* Project Updates: The trail so far (Day-by-day chronicle) */}
      {updatesData.totalCount > 0 && (
        <section className="py-20 md:py-28 bg-paper">
          <MaxWidthWrapper>
            <RevealBlock className="mb-10 md:mb-12">
              <Eyebrow className="mb-4">The trail so far</Eyebrow>
              <h2 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.1] text-[clamp(1.9rem,4.5vw,3rem)] text-balance">
                {updatesData.totalCount} days of action
              </h2>
            </RevealBlock>
            <RevealBlock>
              <ProjectUpdatesTimeline
                projectId={project.id}
                initialData={updatesData}
              />
            </RevealBlock>
          </MaxWidthWrapper>
        </section>
      )}

      {/* Action phases (Events linked to project) */}
      {events.length > 0 && (
        <section className="py-20 md:py-28 bg-wash">
          <MaxWidthWrapper>
            <RevealBlock className="mb-10 md:mb-12">
              <Eyebrow className="mb-4">Action phases</Eyebrow>
              <h2 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.1] text-[clamp(1.9rem,4.5vw,3rem)] text-balance">
                Organized gatherings
              </h2>
            </RevealBlock>
            <RevealBlock>
              <div className="border-t border-hairline">
                {events.map((event: any, i: number) => (
                  <TimelineRow
                    key={event.id}
                    marker={String(i + 1).padStart(2, "0")}
                    title={event.title}
                    description={event.description}
                    meta={new Date(event.startDate).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  >
                    <div className="mt-4">
                      <QuietLink href={`/events/${event.slug}`} className="text-sm">
                        View phase details
                      </QuietLink>
                    </div>
                  </TimelineRow>
                ))}
              </div>
            </RevealBlock>
          </MaxWidthWrapper>
        </section>
      )}

      {/* Moments */}
      {moments.length > 0 && (
        <section className="py-20 md:py-28 bg-wash">
          <MaxWidthWrapper>
            <RevealBlock className="mb-10 md:mb-12">
              <Eyebrow className="mb-4">From the field</Eyebrow>
              <h2 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.1] text-[clamp(1.9rem,4.5vw,3rem)] text-balance">
                Moments
              </h2>
            </RevealBlock>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-12 items-start">
              {moments.map((m: any, i: number) => (
                <RevealBlock
                  key={m.url || i}
                  className={
                    i === 0
                      ? "md:col-span-7"
                      : i === 1
                        ? "md:col-span-5 md:col-start-8"
                        : "md:col-span-6 md:col-start-2"
                  }
                >
                  <EditorialImage
                    src={m.url}
                    alt={`${project.title} — moment ${i + 1}`}
                    ratio={i === 0 ? "3/2" : "4/5"}
                    sizes={i === 0 ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 40vw"}
                    caption={project.title}
                    fallbackText={project.title}
                  />
                </RevealBlock>
              ))}
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      {/* Associated links */}
      <section className="py-14 bg-paper border-t border-hairline">
        <MaxWidthWrapper>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <QuietLink href="/projects">All projects</QuietLink>
            <QuietLink href="/events">Upcoming events</QuietLink>
          </div>
        </MaxWidthWrapper>
      </section>

      <InvitePanel
        statement="Every project needs more hands."
        primaryText="Join the club"
        primaryHref="/join"
        secondaryText="Partner with us"
        secondaryHref="/partner"
      />
    </main>
  );
}
