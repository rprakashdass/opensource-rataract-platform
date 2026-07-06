import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventDashboard from "./_components/EventDashboard";

export default async function EventManagementPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      project: { select: { title: true } },
      registrations: {
        orderBy: { registeredAt: "desc" },
        include: {
          member: { select: { name: true, email: true } }
        }
      },
      minutes: { select: { content: true } },
      attendance: { select: { id: true, memberId: true } },
      transactions: { select: { id: true, title: true, amount: true, type: true, status: true } },
    }
  });

  if (!event) notFound();

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
        {/* Placeholder settings trigger or use ProjectSettings style menu */}
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Event Settings
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{event.title}</h1>
        {event.description && <p className="text-gray-500 max-w-3xl leading-relaxed">{event.description}</p>}
      </div>

      <EventDashboard event={event as any} />
    </div>
  );
}
