import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Users, 
  IndianRupee, 
  ArrowRight,
  TrendingUp,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader, PortalEmptyState } from "@/components/portal";

// ─── Category Chips ──────────────────────────────────────────────────────────

function CategoryFilters({ currentCategory }: { currentCategory: string }) {
  const categories: { label: string; value: string }[] = [
    { label: "All Categories", value: "" },
    { label: "Community Service", value: "COMMUNITY_SERVICE" },
    { label: "Professional Dev", value: "PROFESSIONAL_DEVELOPMENT" },
    { label: "Club Service", value: "CLUB_SERVICE" },
    { label: "International", value: "INTERNATIONAL_SERVICE" },
    { label: "Fundraiser", value: "FUNDRAISER" },
    { label: "Other", value: "OTHER" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((c) => (
        <Link
          key={c.value}
          href={c.value ? `?category=${c.value}` : "?"}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
            currentCategory === c.value
              ? "bg-brand text-white border-brand"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({
  label,
  icon,
  count,
}: {
  label: string;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 px-4 pt-6 pb-2 border-b border-slate-100 mb-4">
      {icon}
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{count}</span>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ProjectsAdminPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.category || "";
  const limitParam = parseInt(searchParams.limit || "30", 10);
  const limit = Math.min(Math.max(limitParam, 1), 200);

  const club = await getCurrentClub();
  if (!club) return null;

  const baseWhere: any = {
    clubId: club.id,
    ...(category ? { category } : {}),
  };

  const projects = await prisma.project.findMany({
    where: baseWhere,
    include: {
      events: {
        include: {
          registrations: {
            select: { memberId: true }
          }
        }
      },
      budget: true,
      transactions: {
        where: { type: "EXPENSE", status: "APPROVED" },
        select: { amount: true }
      }
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  // Bucketing
  const active = [];
  const planning = [];
  const completed = [];
  const other = [];

  for (const project of projects) {
    if (project.status === "ACTIVE") active.push(project);
    else if (project.status === "PLANNING") planning.push(project);
    else if (project.status === "COMPLETED") completed.push(project);
    else other.push(project);
  }

  const hasMore = projects.length === limit;
  const totalVisible = projects.length;

  const renderProjectCard = (project: any) => {
    // Stats Calculations
    const completedEvents = project.events.filter((e: any) => e.status === "COMPLETED").length;
    
    // Collect unique volunteer IDs
    const volunteerSet = new Set<string>();
    project.events.forEach((e: any) => {
      e.registrations.forEach((r: any) => {
        if (r.memberId) volunteerSet.add(r.memberId);
      });
    });
    const volunteersCount = volunteerSet.size;

    // Budget calculations
    const budgetAllocated = project.budget?.allocatedAmount ? Number(project.budget.allocatedAmount) : 25000;
    const budgetSpent = project.transactions.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const budgetProgress = Math.min((budgetSpent / budgetAllocated) * 100, 100);

    return (
      <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all group min-w-[280px]">
        <div className="space-y-4">
          {/* Title & Status */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {project.category.replace(/_/g, " ")}
              </Badge>
              <h3 className="font-bold text-slate-900 group-hover:text-brand transition-colors text-lg">
                {project.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {project.description || "No description provided."}
              </p>
            </div>
            <Badge className={
              project.status === "ACTIVE" 
                ? "bg-emerald-500 text-white" 
                : project.status === "PLANNING" 
                ? "bg-amber-500 text-white" 
                : "bg-slate-500 text-white"
            }>
              {project.status}
            </Badge>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{completedEvents} events</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{volunteersCount} vols</span>
            </div>
          </div>

          {/* Budget tracking progress */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-500">Budget Spent</span>
              <span className="text-slate-900 truncate pl-2">
                ₹{budgetSpent.toLocaleString()} / ₹{budgetAllocated.toLocaleString()}
              </span>
            </div>
            <Progress value={budgetProgress} className="h-1.5" />
          </div>
        </div>

        {/* Footer link */}
        <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
          <Button variant="ghost" size="sm" asChild className="group-hover:text-brand">
            <Link href={`/admin/projects/${project.id}`} className="flex items-center gap-1">
              Open Project <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2 px-4 sm:px-0">
      {/* Header */}
      <PageHeader
        title="Projects"
        description="Manage and track club-wide long-term initiatives."
        actions={
          <Button asChild size="sm" className="bg-brand hover:bg-brand-deep text-white w-full sm:w-auto">
            <Link href="/admin/projects/create" className="flex items-center gap-1.5 justify-center">
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </Button>
        }
      />

      <CategoryFilters currentCategory={category} />

      {totalVisible === 0 ? (
        <PortalEmptyState
          title="No projects found"
          detail="Try adjusting your filters or create a new project."
          action={<Button asChild><Link href="/admin/projects/create">Create Project</Link></Button>}
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <details open className="group">
              <summary className="list-none cursor-pointer">
                <SectionLabel label="Active Projects" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} count={active.length} />
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {active.map(renderProjectCard)}
              </div>
            </details>
          )}

          {planning.length > 0 && (
            <details open className="group">
              <summary className="list-none cursor-pointer">
                <SectionLabel label="Planning Phase" icon={<Briefcase className="w-4 h-4 text-amber-500" />} count={planning.length} />
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {planning.map(renderProjectCard)}
              </div>
            </details>
          )}

          {completed.length > 0 && (
            <details className="group">
              <summary className="list-none cursor-pointer">
                <SectionLabel label="Completed" icon={<FolderOpen className="w-4 h-4 text-slate-400" />} count={completed.length} />
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {completed.map(renderProjectCard)}
              </div>
            </details>
          )}

          {other.length > 0 && (
            <details className="group">
              <summary className="list-none cursor-pointer">
                <SectionLabel label="Other Status" icon={<FolderOpen className="w-4 h-4 text-slate-400" />} count={other.length} />
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {other.map(renderProjectCard)}
              </div>
            </details>
          )}

          {hasMore && (
            <div className="text-center pt-8 border-t border-slate-100">
              <Button variant="outline" asChild>
                <Link href={`?limit=${limit + 30}${category ? `&category=${category}` : ''}`}>
                  Load more projects
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
