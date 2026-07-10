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

  const safeMember = {
    ...member,
    boardMemberships: member.boardMemberships?.map((b: any) => ({
      ...b,
      financialYear: b.financialYear ? {
        ...b.financialYear,
        openingBalance: Number(b.financialYear.openingBalance),
        closingBalance: b.financialYear.closingBalance ? Number(b.financialYear.closingBalance) : null
      } : null
    }))
  };

  return <EditMemberForm member={safeMember} />;
}
