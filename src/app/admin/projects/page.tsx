import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Users, 
  IndianRupee, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function ProjectsAdminPage() {
  const projects = await prisma.project.findMany({
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
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track club-wide long-term initiatives.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/projects/create" className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create Project
          </Link>
        </Button>
      </div>

      {/* Grid listing */}
      {projects.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-16 text-center max-w-xl mx-auto mt-8 space-y-4">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-800">No projects yet</h3>
            <p className="text-sm text-slate-400">
              Create your first project and start coordinating team activities, budgets and events.
            </p>
          </div>
          <Button asChild size="sm" className="mt-2">
            <Link href="/admin/projects/create">Create Project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            // Stats Calculations
            const completedEvents = project.events.filter(e => e.status === "COMPLETED").length;
            
            // Collect unique volunteer IDs
            const volunteerSet = new Set<string>();
            project.events.forEach(e => {
              e.registrations.forEach(r => {
                if (r.memberId) volunteerSet.add(r.memberId);
              });
            });
            const volunteersCount = volunteerSet.size;

            // Budget calculations
            const budgetAllocated = project.budget?.allocatedAmount ? Number(project.budget.allocatedAmount) : 25000; // Fallback for visual mock
            const budgetSpent = project.transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
            const budgetProgress = Math.min((budgetSpent / budgetAllocated) * 100, 100);

            return (
              <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="space-y-4">
                  {/* Title & Status */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {project.category.replace(/_/g, " ")}
                      </Badge>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-lg">
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
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{completedEvents} events completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{volunteersCount} volunteers</span>
                    </div>
                  </div>

                  {/* Budget tracking progress */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Budget Spent</span>
                      <span className="text-slate-900">
                        ₹{budgetSpent.toLocaleString()} / ₹{budgetAllocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={budgetProgress} className="h-1.5" />
                  </div>
                </div>

                {/* Footer link */}
                <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
                  <Button variant="ghost" size="sm" asChild className="group-hover:text-indigo-600">
                    <Link href={`/admin/projects/${project.id}`} className="flex items-center gap-1">
                      Open Project <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
