import { getMemberEvents } from "@/features/events/queries/getMemberEvents";
import { notFound, redirect } from "next/navigation";
import DashboardEventsClient from "./_components/DashboardEventsClient";
import { PageHeader } from "@/components/portal";

export default async function MemberEventsPage() {
    const data = await getMemberEvents();

    if (data.error || !data.memberId) {
        if (data.error === "Unauthorized") redirect("/auth/login");
        return <div className="text-center py-20 text-slate-500">Error loading events</div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <PageHeader
                title="My Events"
                description="Discover, register, and track your event participation."
            />

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
