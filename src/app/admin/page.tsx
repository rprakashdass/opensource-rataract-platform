import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { 
  Plus, 
  Calendar, 
  Briefcase, 
  IndianRupee, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Receipt,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const session = await getSession();

  // Get current club info
  const club = await prisma.club.findFirst();
  const clubName = club?.name || "Rotaract Club of XYZ";

  let membersCount = 0;
  let activeProjectsCount = 0;
  let upcomingEventsCount = 0;
  let balance = 0;
  let totalIncome = 0;
  let totalExpenses = 0;
  let monthlyExpenses = 0;
  let pendingApprovalsCount = 0;

  let upcomingEvents: any[] = [];
  let activeProjects: any[] = [];
  let recentActivity: any[] = [];

  try {
    membersCount = await prisma.member.count();
    activeProjectsCount = await prisma.project.count({ where: { status: "ACTIVE" } });
    upcomingEventsCount = await prisma.event.count({ where: { status: "UPCOMING" } });
    
    // Finance Calculations
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [incomeAgg, expenseAgg, monthlyExpenseAgg, pendingCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: "INCOME", status: "APPROVED" },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE", status: "APPROVED" },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE", status: "APPROVED", createdAt: { gte: startOfMonth } },
        _sum: { amount: true }
      }),
      prisma.transaction.count({
        where: { status: "PENDING_APPROVAL" }
      })
    ]);

    totalIncome = incomeAgg._sum.amount ? Number(incomeAgg._sum.amount) : 0;
    totalExpenses = expenseAgg._sum.amount ? Number(expenseAgg._sum.amount) : 0;
    balance = totalIncome - totalExpenses;
    monthlyExpenses = monthlyExpenseAgg._sum.amount ? Number(monthlyExpenseAgg._sum.amount) : 0;
    pendingApprovalsCount = pendingCount;

    // Upcoming Events
    upcomingEvents = await prisma.event.findMany({
      where: { status: "UPCOMING" },
      orderBy: { startTime: "asc" },
      take: 3,
      include: { 
        project: { select: { title: true } }, 
        _count: { select: { registrations: true } } 
      }
    });

    // Active Projects
    activeProjects = await prisma.project.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: {
        _count: { select: { events: true } }
      }
    });

    // Recent activity logs
    recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } }
      }
    });

  } catch (error) {
    console.warn("Dashboard stats fetch failed:", error);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header & Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {session?.name || "Leader"}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clubName}</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/events/create" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/projects/create" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/finance/transactions/new" className="flex items-center gap-1.5">
              <Receipt className="w-4 h-4" /> Add Expense
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/members" className="flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{activeProjectsCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Events</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{upcomingEventsCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Expenses</span>
            <IndianRupee className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">₹{monthlyExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{membersCount}</p>
        </div>
      </div>

      {/* Main Grid sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Events</h2>
              <Link href="/admin/events" className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No upcoming events.</div>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-800 text-sm">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(event.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        {event.project && (
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            Project: {event.project.title}
                          </span>
                        )}
                        <span>{event._count.registrations} registrations</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/events/${event.id}`}>Manage</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Active Projects</h2>
              <Link href="/admin/projects" className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {activeProjects.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No active projects.</div>
              ) : (
                activeProjects.map((project) => (
                  <div key={project.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-slate-800 text-sm">{project.title}</h3>
                      <p className="text-xs text-slate-500">
                        {project.category.replace(/_/g, " ")} • {project._count.events} events completed
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/projects/${project.id}`}>Open Project</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Finance Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Finance Snapshot</h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Treasury Balance</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">₹{balance.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-0.5">
                    Income <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">₹{totalIncome.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-0.5">
                    Expenses <ArrowDownRight className="w-3 h-3 text-rose-500" />
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">₹{totalExpenses.toLocaleString()}</p>
                </div>
              </div>

              {pendingApprovalsCount > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-semibold text-amber-800">{pendingApprovalsCount} pending approvals</span>
                  </div>
                  <Link href="/admin/finance" className="text-[10px] font-bold text-amber-900 uppercase hover:underline">
                    Review
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            
            <div className="space-y-3.5">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400">No activity recorded yet.</p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-slate-800">
                        <span className="font-semibold text-slate-950">{log.user?.name || "System"}</span>{" "}
                        {log.action}d {log.entity}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
