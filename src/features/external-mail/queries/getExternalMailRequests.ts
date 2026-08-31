import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";

export async function getMyExternalMailRequests() {
  const session = await getSession();
  if (!session?.id) return { error: "Unauthorized" };

  const member = await prisma.member.findUnique({ where: { userId: session.id } });
  if (!member) return { error: "Member profile not found" };

  const requests = await prisma.externalMailRequest.findMany({
    where: { requestedById: member.id },
    orderBy: { createdAt: "desc" },
  });

  return { requests };
}

export async function getMyExternalMailRequestById(id: string) {
  const session = await getSession();
  if (!session?.id) return { error: "Unauthorized" };

  const member = await prisma.member.findUnique({ where: { userId: session.id } });
  if (!member) return { error: "Member profile not found" };

  const request = await prisma.externalMailRequest.findUnique({ where: { id } });
  if (!request) return { error: "Mail request not found" };
  if (request.requestedById !== member.id) return { error: "Unauthorized" };

  return { request };
}

export async function getExternalMailRequestForAdmin(id: string) {
  const request = await prisma.externalMailRequest.findUnique({
    where: { id },
    include: {
      requestedBy: { select: { id: true, name: true, avatar: true } },
      reviewedBy: { select: { id: true, name: true } },
      sentBy: { select: { id: true, name: true } },
    },
  });

  if (!request) return { error: "Mail request not found" };

  return { request };
}

export async function getClubExternalMailRequests(status?: string) {
  const club = await getCurrentClub();
  if (!club) return { error: "Club not found" };

  const requests = await prisma.externalMailRequest.findMany({
    where: { clubId: club.id, ...(status ? { status: status as any } : {}) },
    orderBy: { createdAt: "desc" },
    include: {
      requestedBy: { select: { id: true, name: true, avatar: true } },
      reviewedBy: { select: { id: true, name: true } },
      sentBy: { select: { id: true, name: true } },
    },
  });

  return { requests };
}
