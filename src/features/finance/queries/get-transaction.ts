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
      contributor: { select: { name: true, contact: true } },
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

    // `createdBy`/`approvedBy` are plain userId strings (no Prisma relation),
    // so resolve them to display names manually.
    const actorIds = [transaction.createdBy, transaction.approvedBy].filter((v): v is string => !!v);
    const actors = actorIds.length
      ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, email: true } })
      : [];
    const creator = actors.find((u) => u.id === transaction.createdBy) || null;
    const approver = actors.find((u) => u.id === transaction.approvedBy) || null;

    return { ...transaction, auditLogs, creator, approver };
  }

  return null;
}
