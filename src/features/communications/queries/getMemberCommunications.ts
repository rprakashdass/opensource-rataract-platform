import { prisma } from "@/lib/prisma";

export async function getMemberCommunications(memberId: string, filters: {
  status?: string;
  type?: string;
}) {
  const where: any = {
    memberId,
  };

  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.type) {
    where.type = filters.type;
  }

  return prisma.memberCommunication.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}
