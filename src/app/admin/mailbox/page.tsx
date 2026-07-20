import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";
import { getClubCommunications } from "@/features/communications/actions/communicationActions";
import { getComplaints } from "@/features/complaints/queries/getComplaints";
import AdminInboxClient from "./_components/AdminInboxClient";

export const metadata = { title: "Inbox | Admin Dashboard" };

export default async function AdminMailboxPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const club = await getCurrentClub();
  if (!club) redirect("/admin");

  // Fetch both datasets concurrently
  const [commsResult, complaintsResult] = await Promise.all([
    getClubCommunications(),
    getComplaints(club.id),
  ]);

  const memberCommunications = "data" in commsResult && Array.isArray(commsResult.data) ? commsResult.data : [];
  const anonymousComplaints = "data" in complaintsResult && Array.isArray(complaintsResult.data) ? complaintsResult.data : [];

  return (
    <AdminInboxClient
      memberCommunications={memberCommunications}
      anonymousComplaints={anonymousComplaints}
    />
  );
}
