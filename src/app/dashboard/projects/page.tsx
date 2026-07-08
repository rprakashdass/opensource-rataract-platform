import { getMemberProjects } from "@/features/projects/queries/getMemberProjects";
import { notFound, redirect } from "next/navigation";
import DashboardProjectsClient from "./_components/DashboardProjectsClient";
import { Briefcase } from "lucide-react";

export default async function MemberProjectsPage() {
    const data = await getMemberProjects();

    if (data.error || !data.memberId) {
        if (data.error === "Unauthorized") redirect("/auth/login");
        return <div className="text-center py-20 text-slate-500">Error loading projects</div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
                        <Briefcase className="w-8 h-8 text-purple-600" />
                        My Projects
                    </h1>
                    <p className="text-slate-500 font-medium">Explore and contribute to club initiatives.</p>
                </div>
            </div>

            <DashboardProjectsClient 
                available={data.available} 
                joined={data.joined} 
                memberId={data.memberId}
            />
        </div>
    );
}
