import { getMemberEvents } from "@/features/events/queries/getMemberEvents";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Settings, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DashboardEventsClient from "./_components/DashboardEventsClient";
import { PageHeader } from "@/components/portal";

export default async function MemberEventsPage() {
    const data = await getMemberEvents();

    if (data.error || !data.memberId) {
        if (data.error === "Unauthorized") redirect("/auth/login");
        return <div className="text-center py-20 text-ink-soft">Error loading events</div>;
    }

    // Events this member chairs / co-chairs — they get full management access.
    const chairing = await prisma.eventMember.findMany({
        where: { memberId: data.memberId, role: { in: ["CHAIR", "CO_CHAIR"] } },
        include: { event: { select: { id: true, title: true, status: true, publishStatus: true, startDate: true, submittedForReviewAt: true } } },
        orderBy: { event: { startDate: "desc" } },
    });

    return (
        <div className="space-y-8 pb-10">
            <PageHeader
                title="My Events"
                description="Discover, register, and track your event participation."
            />

            {chairing.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Events I run</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {chairing.map(({ role, event: e }) => (
                            <Link
                                key={e.id}
                                href={`/member/events/${e.id}/manage`}
                                className="motion-card group flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-white p-4 hover:border-brand transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="font-bold text-ink truncate">{e.title}</p>
                                    <p className="mt-0.5 text-xs font-medium text-ink-faint">
                                        {role === "CO_CHAIR" ? "Co-Chair" : "Chair"}
                                        {" · "}
                                        {e.publishStatus === "DRAFT"
                                            ? (e.submittedForReviewAt ? "Awaiting approval" : "Draft")
                                            : e.status.charAt(0) + e.status.slice(1).toLowerCase()}
                                    </p>
                                </div>
                                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft group-hover:text-brand transition-colors">
                                    {e.publishStatus === "DRAFT" && e.submittedForReviewAt
                                        ? <Clock className="w-4 h-4" />
                                        : <Settings className="w-4 h-4" />}
                                    Manage
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <DashboardEventsClient
                available={data.available} 
                registered={data.registered} 
                checkInAvailable={data.checkInAvailable}
                attended={data.attended} 
                completed={data.completed}
                memberId={data.memberId}
            />
        </div>
    );
}
