import { getMemberProjects } from "@/features/projects/queries/getMemberProjects";
import { notFound, redirect } from "next/navigation";
import DashboardProjectsClient from "./_components/DashboardProjectsClient";
import { PageHeader } from "@/components/portal";

export default async function MemberProjectsPage() {
    const data = await getMemberProjects();

    if (data.error || !data.memberId) {
        if (data.error === "Unauthorized") redirect("/auth/login");
        return <div className="text-center py-20 text-slate-500">Error loading projects</div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <PageHeader
                title="My Projects"
                description="Explore and contribute to club projects."
            />

            <DashboardProjectsClient 
                available={data.available} 
                joined={data.joined} 
                memberId={data.memberId}
            />
        </div>
    );
}
