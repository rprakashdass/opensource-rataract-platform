import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import {
  Layout,
  Image as ImageIcon,
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
  Camera
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import WebsiteModuleToggles from "./_components/WebsiteModuleToggles";

export default async function WebsiteControlCenter() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const settings = await getOrCreateWebsiteSettings(club.id);

  const modules = [
    {
      title: "Homepage Editor",
      description: "Manage hero text, call to actions, and homepage images.",
      icon: Layout,
      href: "/admin/website/homepage",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "About Page & Story",
      description: "Write your club's story and manage your history.",
      icon: BookOpen,
      href: "/admin/website/about",
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Club Milestones",
      description: "Build an interactive timeline of your club's major achievements.",
      icon: Flag,
      href: "/admin/website/milestones",
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "Portfolios",
      description: "Define your club's avenues of service shown on the About page.",
      icon: Layers,
      href: "/admin/settings/portfolios",
      color: "bg-violet-100 text-violet-600"
    },
    {
      title: "Sponsors & Packages",
      description: "Manage sponsor logos and sponsorship tiers shown on /partner.",
      icon: HandCoins,
      href: "/admin/sponsors",
      color: "bg-teal-100 text-teal-600"
    },
    {
      title: "Gallery Page",
      description: "Manage the Gallery page copy and the homepage photo teaser.",
      icon: Camera,
      href: "/admin/website/gallery",
      color: "bg-pink-100 text-pink-600"
    },
    {
      title: "Events Page",
      description: "Manage the copy shown on the public Events page.",
      icon: Calendar,
      href: "/admin/website/events",
      color: "bg-sky-100 text-sky-600"
    },
    {
      title: "Projects Page",
      description: "Manage the copy shown on the public Projects page.",
      icon: Flame,
      href: "/admin/website/projects",
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Join Page",
      description: "Manage the copy shown on the public \"Join Us\" page.",
      icon: UserPlus,
      href: "/admin/website/join",
      color: "bg-cyan-100 text-cyan-600"
    },
    {
      title: "Membership Inquiries",
      description: "View and manage people who want to join the club.",
      icon: MessageSquareHeart,
      href: "/admin/inquiries",
      color: "bg-rose-100 text-rose-600"
    },
    {
      title: "Public Announcements",
      description: "Post club news, updates, and general information.",
      icon: Megaphone,
      href: "/admin/announcements",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "Media Gallery",
      description: "Manage photo albums and event galleries.",
      icon: ImageIcon,
      href: "/admin/gallery",
      color: "bg-pink-100 text-pink-600"
    },
    {
      title: "Leadership Team",
      description: "Your board members automatically populate the public Team page.",
      icon: Users,
      href: "/admin/board",
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Website Control Center</h1>
          <p className="text-slate-500 mt-1">Manage public pages, marketing copy, and website features.</p>
        </div>
        <Link href="/" target="_blank">
          <Button className="bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800">
            View Live Website <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Links to Editors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Content Editors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <Link href={mod.href} key={idx}>
                    <div className="group border border-slate-100 p-4 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all flex gap-4 h-full">
                      <div className={`p-3 rounded-xl h-fit shrink-0 ${mod.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{mod.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{mod.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Homepage Toggles */}
        <div className="space-y-6">
          <WebsiteModuleToggles settings={settings} />
        </div>
      </div>
    </div>
  );
}
