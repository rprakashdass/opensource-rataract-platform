import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getTransaction(id: string) {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      project: { select: { title: true } },
      event: { select: { title: true } },
      account: { select: { name: true, type: true } },
      financialYear: { select: { name: true } },
      user: { select: { name: true, email: true } },
      member: { select: { name: true, email: true } },
      paymentRequest: { select: { title: true } },
    }
  });

  if (transaction) {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity: "transaction",
        entityId: id,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    return { ...transaction, auditLogs };
  }

  return null;
}
