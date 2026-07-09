import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";

const commentInclude = {
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: { author: { select: { id: true, name: true, email: true } } },
  },
  portfolio: { select: { id: true, name: true, icon: true } },
  proposedBy: { select: { id: true, name: true, avatar: true, email: true } },
  reviewedBy: { select: { id: true, name: true } },
  convertedEvent: { select: { id: true, title: true, slug: true } },
  convertedProject: { select: { id: true, title: true, slug: true } },
};

// Visible to every logged-in member of the club (shared idea board) — not just the proposer.
export async function getVisibleInitiatives(opts?: { status?: string; mineOnly?: boolean }) {
  const session = await getSession();
  if (!session?.id) return { error: "Unauthorized" };

  const member = await prisma.member.findUnique({ where: { userId: session.id } });
  if (!member) return { error: "Member profile not found" };

  const initiatives = await prisma.initiative.findMany({
    where: {
      clubId: member.clubId,
      ...(opts?.status ? { status: opts.status as any } : {}),
      // Drafts are private scratchpads — only the author sees their own; everyone sees anything submitted.
      ...(opts?.mineOnly
        ? { proposedById: member.id }
        : { OR: [{ proposedById: member.id }, { status: { not: "DRAFT" } }] }),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      portfolio: { select: { id: true, name: true, icon: true } },
      proposedBy: { select: { id: true, name: true, avatar: true } },
      convertedEvent: { select: { id: true, title: true, slug: true } },
      convertedProject: { select: { id: true, title: true, slug: true } },
    },
  });

  return { initiatives, currentMemberId: member.id };
}

// Detail view: any club member can see it; only the proposer can edit it.
export async function getInitiativeForMember(id: string) {
  const session = await getSession();
  if (!session?.id) return { error: "Unauthorized" };

  const member = await prisma.member.findUnique({ where: { userId: session.id } });
  if (!member) return { error: "Member profile not found" };

  const initiative = await prisma.initiative.findUnique({
    where: { id },
    include: commentInclude,
  });

  if (!initiative) return { error: "Proposal not found" };
  if (initiative.clubId !== member.clubId) return { error: "Unauthorized" };

  const isOwner = initiative.proposedById === member.id;
  if (initiative.status === "DRAFT" && !isOwner) return { error: "Unauthorized" };

  return { initiative, isOwner };
}

export async function getClubInitiatives(status?: string) {
  const club = await getCurrentClub();
  if (!club) return { error: "Club not found" };

  const initiatives = await prisma.initiative.findMany({
    where: { clubId: club.id, ...(status ? { status: status as any } : {}) },
    orderBy: { createdAt: "desc" },
    include: {
      portfolio: { select: { id: true, name: true, icon: true } },
      proposedBy: { select: { id: true, name: true, avatar: true } },
    },
  });

  return { initiatives };
}

export async function getInitiativeForAdmin(id: string) {
  const initiative = await prisma.initiative.findUnique({
    where: { id },
    include: commentInclude,
  });

  if (!initiative) return { error: "Proposal not found" };

  return { initiative };
}
