import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import {
  Layout,
  Users,
  ExternalLink,
  Megaphone,
  BookOpen,
  MessageSquareHeart,
  Flag,
  Layers,
  HandCoins,
  UserPlus,
  Calendar,
  Flame,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/portal";

// Page copy EDITORS — each edits exactly one public page (or site-wide chrome).
const editors = [
  { title: "Homepage", description: "Hero, sections, order, styling & stats.", icon: Layout, href: "/admin/website/homepage", color: "bg-blue-100 text-blue-600" },
  { title: "About Page", description: "Story, mission, vision & history.", icon: BookOpen, href: "/admin/website/about", color: "bg-pink-100 text-brand" },
  { title: "Events Page", description: "Copy shown on the public Events page.", icon: Calendar, href: "/admin/website/events", color: "bg-sky-100 text-sky-600" },
  { title: "Projects Page", description: "Copy shown on the public Projects page.", icon: Flame, href: "/admin/website/projects", color: "bg-orange-100 text-orange-600" },
  { title: "Join Page", description: "Copy shown on the public “Join Us” page.", icon: UserPlus, href: "/admin/website/join", color: "bg-cyan-100 text-cyan-600" },
  { title: "Team Page", description: "Headings & copy on the public Team page.", icon: Users, href: "/admin/website/team", color: "bg-indigo-100 text-indigo-600" },
  { title: "Club Milestones", description: "Interactive timeline of achievements.", icon: Flag, href: "/admin/website/milestones", color: "bg-amber-100 text-amber-600" },
  { title: "Site Settings", description: "Footer content & SEO across every page.", icon: Settings, href: "/admin/website/settings", color: "bg-slate-100 text-slate-600" },
];

// Records & operational screens that FEED the public site but aren't page-copy
// editors — surfaced as quiet links so admins know where they live.
const elsewhere = [
  { title: "Sponsors & Packages", icon: HandCoins, href: "/admin/sponsors" },
  { title: "Service Portfolios", icon: Layers, href: "/admin/settings/portfolios" },
  { title: "Leadership / Board", icon: Users, href: "/admin/board" },
  { title: "Membership Inquiries", icon: MessageSquareHeart, href: "/admin/inquiries" },
  { title: "Announcements", icon: Megaphone, href: "/admin/announcements" },
];

export default async function WebsiteControlCenter() {
  const club = await getCurrentClub();
  if (!club) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Website Control Center"
        description="Edit the copy and layout of each public page."
        actions={
          <Link href="/" target="_blank">
            <Button className="bg-brand hover:bg-brand-deep text-white rounded-xl">
              View Live Website <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
      />

      {/* Page editors */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Edit pages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editors.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link href={mod.href} key={mod.href} className="group">
                <div className="border border-slate-200 bg-white p-4 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all flex gap-4 h-full">
                  <div className={`p-3 rounded-xl h-fit shrink-0 ${mod.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-brand transition-colors">{mod.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{mod.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Managed elsewhere */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Manage elsewhere</h2>
        <div className="flex flex-wrap gap-2">
          {elsewhere.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-brand transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors" />
                {item.title}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
