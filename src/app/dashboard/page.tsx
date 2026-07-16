import { getMemberDashboard } from "@/features/members/queries/getMemberDashboard";
import { notFound, redirect } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  Briefcase, 
  TrendingUp, 
  ChevronRight, 
  Bell, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  FileText,
  UserCircle,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { PageHeader, StatCard, StatGrid } from "@/components/portal";
import DashboardCheckInCard from "./_components/DashboardCheckInCard";

export default async function MemberDashboardPage() {
  const { member, profileCompletion, stats, upcomingEvents, checkInEvents, pendingPaymentRequests, timeline, error } = await getMemberDashboard();

  if (error || !member) {
      if (error === "Unauthorized") redirect("/auth/login");
      if (error === "Member profile not found.") {
          return (
            <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 max-w-md mx-auto space-y-4 px-4">
              <UserCircle className="w-16 h-16 text-slate-300" />
              <h2 className="text-xl font-semibold text-slate-800">Member Profile Required</h2>
              <p>Your account is not currently linked to a member profile.</p>
              <p className="text-sm">If you are an administrator, please create a member profile for yourself in the Admin Dashboard and link it to your User account.</p>
              <div className="pt-4">
                <Link href="/admin/members/new">
                  <Button>Create Member Profile</Button>
                </Link>
              </div>
            </div>
          );
      }
      return <div className="text-center py-20 text-slate-500">{error || "Error loading dashboard"}</div>;
  }

  return (
    <div className="space-y-6 pb-20 max-w-[390px] mx-auto md:max-w-6xl md:space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Header */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <PageHeader
          className="mb-0"
          title={`Hello, ${(member.name || "Member").split(" ")[0]} 👋`}
          description="Here's what's happening in your club today."
          actions={
            <MemberAvatar name={member.name} avatarUrl={member.avatar} className="w-14 h-14 border-2 border-white shadow-sm" textClassName="text-lg" />
          }
        />
      </section>

      {/* Today Section (Urgent Actions) */}
      <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 px-1">Today</h2>
          
          {checkInEvents && checkInEvents.length > 0 ? (
              checkInEvents.map((event: any) => (
                  <DashboardCheckInCard key={event.id} event={event} />
              ))
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                  <div>
                      <h3 className="font-bold text-slate-900">{upcomingEvents[0].title}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1" suppressHydrationWarning>Starts {new Date(upcomingEvents[0].startDate).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/dashboard/events/${upcomingEvents[0].id}`}>
                      <Button variant="secondary" size="sm" className="rounded-xl font-semibold">View</Button>
                  </Link>
              </div>
          ) : (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
                  <p className="text-slate-500 font-medium text-sm">No events happening today.</p>
                  <Link href="/dashboard/events">
                      <Button variant="link" className="text-brand px-0">Explore Upcoming Events <ArrowRight className="w-3 h-3 ml-1" /></Button>
                  </Link>
              </div>
          )}
      </section>

      {/* Pending Payments Section */}
      {pendingPaymentRequests && pendingPaymentRequests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 px-1">Payment Requests</h2>
          <div className="space-y-3">
            {pendingPaymentRequests.map((pr: any) => {
              // Generate UPI link
              const upiId = member.club?.upiId;
              const clubName = member.club?.name || "Club";
              const amount = pr.amount.toString();
              // Format category label, e.g. EVENT_FEE -> Event Fee
              const categoryLabel = pr.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
              const upiLink = upiId ? `upi://pay?pa=${upiId}&pn=${clubName}&am=${amount}&cu=INR&tn=${categoryLabel}` : "";

              return (
                <div key={pr.id} className="bg-rose-50 border border-rose-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3 animate-in fade-in duration-300">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-rose-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wide">Pending Payment</span>
                      </div>
                      <h3 className="font-bold text-slate-900 leading-tight">{pr.title}</h3>
                      {pr.description && <p className="text-xs text-slate-600 mt-1">{pr.description}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-rose-700">₹{pr.amount}</span>
                      {pr.dueDate && (
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5 whitespace-nowrap" suppressHydrationWarning>
                          Due {new Date(pr.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {upiId ? (
                      <>
                        <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 font-bold rounded-xl shadow-sm flex-1">
                          <a href={upiLink}>Pay via UPI App</a>
                        </Button>
                        <Button variant="outline" className="w-full border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl font-bold bg-white flex-1" asChild>
                          <Link href={`/dashboard/finance/submit?amount=${pr.amount}&desc=${encodeURIComponent(pr.title)}&requestId=${pr.id}`}>Submit Receipt</Link>
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full bg-rose-600 hover:bg-rose-700 font-bold rounded-xl shadow-sm" asChild>
                        <Link href={`/dashboard/finance/submit?amount=${pr.amount}&desc=${encodeURIComponent(pr.title)}&requestId=${pr.id}`}>Submit Receipt</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Next Actions (Scrollable Pills) */}
      <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 px-1">Next Actions</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x scrollbar-hide">
              
              {profileCompletion < 100 && (
                  <Link href="/dashboard/profile" className="snap-start shrink-0">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 min-w-[200px]">
                          <div className="bg-amber-100 p-2 rounded-full">
                              <UserCircle className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                              <p className="font-bold text-amber-900 text-sm leading-tight">Complete Profile</p>
                              <p className="text-xs text-amber-700 font-medium">{profileCompletion}% Done</p>
                          </div>
                      </div>
                  </Link>
              )}

              {upcomingEvents && upcomingEvents.length > 1 && (
                  <Link href="/dashboard/events" className="snap-start shrink-0">
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 min-w-[200px]">
                          <div className="bg-blue-100 p-2 rounded-full">
                              <Calendar className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                              <p className="font-bold text-blue-900 text-sm leading-tight">Upcoming Registrations</p>
                              <p className="text-xs text-blue-700 font-medium">{upcomingEvents.length - 1} more events</p>
                          </div>
                      </div>
                  </Link>
              )}

              {!stats.eventsAttended && !checkInEvents?.length && (
                  <Link href="/dashboard/events" className="snap-start shrink-0">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 min-w-[200px]">
                          <div className="bg-slate-200 p-2 rounded-full">
                              <TrendingUp className="w-5 h-5 text-slate-700" />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900 text-sm leading-tight">Join Your First Event</p>
                              <p className="text-xs text-slate-600 font-medium">Earn volunteer hours</p>
                          </div>
                      </div>
                  </Link>
              )}
          </div>
      </section>

      {/* Stats Grid */}
      <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 px-1">Your Impact</h2>
          <StatGrid>
              <StatCard label="Events" value={stats?.eventsAttended || 0} icon={Calendar} tone="brand" />
              <StatCard label="Hours" value={stats?.volunteerHours || 0} icon={Clock} tone="positive" />
              <StatCard label="Projects" value={stats?.projectsJoined || 0} icon={Briefcase} tone="warning" />
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col justify-center items-start relative overflow-hidden">
                  <Bell className="w-16 h-16 text-indigo-900/10 absolute -right-2 -bottom-2" />
                  <div className="relative z-10">
                      <h3 className="font-bold text-indigo-900 mb-1 text-sm">Updates</h3>
                      <p className="text-xs text-indigo-700 font-medium">You're all caught up!</p>
                  </div>
              </div>
          </StatGrid>
      </section>

    </div>
  );
}
