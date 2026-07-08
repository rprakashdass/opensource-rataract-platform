import { getMemberEvents } from "@/features/events/queries/getMemberEvents";
import { notFound, redirect } from "next/navigation";
import DashboardEventsClient from "./_components/DashboardEventsClient";
import { CalendarRange } from "lucide-react";

export default async function MemberEventsPage() {
    const data = await getMemberEvents();

    if (data.error || !data.memberId) {
        if (data.error === "Unauthorized") redirect("/auth/login");
        return <div className="text-center py-20 text-slate-500">Error loading events</div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
                        <CalendarRange className="w-8 h-8 text-purple-600" />
                        My Events
                    </h1>
                    <p className="text-slate-500 font-medium">Discover, register, and track your event participation.</p>
                </div>
            </div>

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
