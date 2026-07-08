import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HomepageEditorForm from "./_components/HomepageEditorForm";

export default async function HomepageEditorPage() {
  const club = await getCurrentClub();
  if (!club) redirect("/setup");

  const settings = await prisma.websiteSettings.upsert({
    where: { clubId: club.id },
    create: { clubId: club.id },
    update: {},
  });

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/website" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Homepage Editor</h1>
          <p className="text-slate-500 mt-1">Manage marketing copy and hero section.</p>
        </div>
      </div>

      <HomepageEditorForm settings={settings} />
    </div>
  );
}
