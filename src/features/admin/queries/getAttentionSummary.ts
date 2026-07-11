import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";

export type AttentionSummary = {
  memberships: { count: number; href: string };
  ideas: { count: number; href: string };
  finance: { count: number; href: string };
  media: { count: number; href: string }; // We keep this as 0 per user instructions
};

export async function getAttentionSummary(clubId: string, roles: string[]): Promise<AttentionSummary> {
  let membershipCount = 0;
  let ideaCount = 0;
  let financeCount = 0;

  const canViewMemberships = roles.some(r => ["SUPER_ADMIN", "CLUB_ADMIN"].includes(r));
  const canViewIdeas = roles.some(r => ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN"].includes(r));
  const canViewFinance = roles.some(r => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));

  const promises = [];

  if (canViewMemberships) {
    promises.push(
      prisma.membershipInquiry.count({
        where: { clubId, status: "PENDING" }
      }).then(count => { membershipCount = count; })
    );
  }

  if (canViewIdeas) {
    promises.push(
      prisma.initiative.count({
        where: { clubId, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }
      }).then(count => { ideaCount = count; })
    );
  }

  if (canViewFinance) {
    promises.push(
      prisma.transaction.count({
        where: { clubId, status: "PENDING_APPROVAL" }
      }).then(count => { financeCount = count; })
    );
  }

  await Promise.all(promises);

  return {
    memberships: { count: membershipCount, href: `${ROUTES.ADMIN}/inquiries` },
    ideas: { count: ideaCount, href: `${ROUTES.ADMIN}/proposals` },
    finance: { count: financeCount, href: `${ROUTES.ADMIN}/finance/transactions` },
    media: { count: 0, href: `${ROUTES.ADMIN}/gallery` }
  };
}
