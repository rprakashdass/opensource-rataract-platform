import { prisma } from "@/lib/prisma";

// Plain upsert races when multiple pages/build workers ensure-exist the same
// row concurrently — two callers can both see "no row" and both try to INSERT,
// so the second hits the unique constraint on clubId. Check-then-create with a
// fallback re-fetch on conflict makes this safe under real concurrency.
export async function getOrCreateWebsiteSettings(clubId: string) {
  const existing = await prisma.websiteSettings.findUnique({ where: { clubId } });
  if (existing) return existing;

  try {
    return await prisma.websiteSettings.create({ data: { clubId } });
  } catch (error: any) {
    if (error.code === "P2002") {
      return await prisma.websiteSettings.findUniqueOrThrow({ where: { clubId } });
    }
    throw error;
  }
}
