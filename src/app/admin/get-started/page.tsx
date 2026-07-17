import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { CheckCircle2, Circle, ArrowRight, Rocket, Users, Globe, Settings, Image, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dismissGetStarted } from "./actions";

export const dynamic = "force-dynamic";

async function getSetupChecklist(clubId: string) {
  const [club, websiteSettings, memberCount] = await Promise.all([
    prisma.club.findFirst(),
    prisma.websiteSettings.findFirst({ where: { clubId } }),
    prisma.member.count({ where: { clubId } }),
  ]);

  return [
    {
      id: "club_profile",
      title: "Set up club profile",
      description: "Add your club's name, logo, contact details, and about text.",
      href: "/admin/settings",
      icon: Settings,
      done: !!(club?.logoUrl && club?.email),
    },
    {
      id: "website",
      title: "Configure the public website",
      description: "Set up your homepage hero, colours, and navigation.",
      href: "/admin/website",
      icon: Globe,
      done: !!(websiteSettings?.heroHeadline),
    },
    {
      id: "members",
      title: "Add your first member",
      description: "Import or manually create at least one club member.",
      href: "/admin/members",
      icon: Users,
      done: memberCount > 0,
    },
    {
      id: "gallery",
      title: "Upload club photos",
      description: "Add photos to your gallery to bring the public site to life.",
      href: "/admin/gallery",
      icon: Image,
      done: false, // checked dynamically
    },
    {
      id: "announcement",
      title: "Send your first announcement",
      description: "Draft and send an announcement to your members.",
      href: "/admin/announcements/new",
      icon: Megaphone,
      done: false,
    },
  ];
}

export default async function GetStartedPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const club = await prisma.club.findFirst();
  if (!club) redirect("/admin");

  const steps = await getSetupChecklist(club.id);
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
          <Rocket className="h-4 w-4" />
          Getting Started
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome to your club portal</h1>
        <p className="text-slate-500 text-sm">
          Complete the steps below to get your platform ready for your team and members.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{completedCount} of {steps.length} completed</span>
          <span className="font-semibold text-purple-600">{progressPct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {allDone && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 text-sm">You're all set!</p>
            <p className="text-xs text-emerald-600">All setup steps are complete. Your platform is ready.</p>
          </div>
          <Button size="sm" className="ml-auto" asChild>
            <Link href="/admin">Go to Dashboard</Link>
          </Button>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={step.href}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${
                step.done
                  ? "border-emerald-200 bg-emerald-50/50 opacity-75"
                  : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm"
              }`}
            >
              {/* Status icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                step.done ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-purple-50"
              }`}>
                {step.done
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  : <Icon className={`h-5 w-5 text-slate-400 group-hover:text-purple-500 transition-colors`} />
                }
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${step.done ? "text-slate-500 line-through" : "text-slate-800"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
              </div>

              {/* Arrow */}
              {!step.done && (
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="pt-2 text-center space-y-4">
        <Link href="/admin" className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 block">
          Skip for now — go to dashboard
        </Link>
        <form action={dismissGetStarted}>
          <button type="submit" className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2">
            Permanently dismiss this checklist
          </button>
        </form>
      </div>
    </div>
  );
}
