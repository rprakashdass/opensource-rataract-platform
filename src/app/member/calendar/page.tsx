import { getNexusCalendarData } from "@/features/members/queries/getNexusCalendarData";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/portal";
import NexusCalendar from "./_components/NexusCalendar";

export default async function NexusCalendarPage() {
  const { entries, error } = await getNexusCalendarData();

  if (error === "Unauthorized") redirect("/auth/login");

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Nexus Calendar"
        description="Events, meetings, projects, and birthdays — all in one place."
      />
      <NexusCalendar entries={entries} />
    </div>
  );
}
