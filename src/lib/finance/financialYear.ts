import { prisma } from "@/lib/prisma";

// Every transaction-creation path used to copy-paste this bootstrap block
// (5 copies, drifting slightly). One shared helper so financial-year
// resolution can only behave one way. Still hardcodes "RY 2026-27" as the
// bootstrap name/dates when no active FY exists yet — this doesn't fix
// annual rollover, it just stops duplicating the fragility.
export async function getOrCreateActiveFinancialYear(clubId: string) {
  const existing = await prisma.financialYear.findFirst({
    where: { clubId, status: "ACTIVE" },
  });
  if (existing) return existing;

  return prisma.financialYear.upsert({
    where: { name: "RY 2026-27" },
    update: { status: "ACTIVE" },
    create: {
      clubId,
      name: "RY 2026-27",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2027-06-30"),
      openingBalance: 0,
      status: "ACTIVE",
    },
  });
}
