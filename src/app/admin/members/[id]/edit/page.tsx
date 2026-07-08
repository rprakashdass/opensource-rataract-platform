import { getMember } from "@/features/members/queries/getMembers";
import { notFound } from "next/navigation";
import EditMemberForm from "./EditMemberForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMemberPage({ params }: PageProps) {
  const { id } = await params;
  const { member, error } = await getMember(id);

  if (error || !member) {
    notFound();
  }

  return <EditMemberForm member={member} />;
}
