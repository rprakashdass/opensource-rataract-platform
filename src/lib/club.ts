import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Returns the single club instance for this self-hosted environment.
 * If no club exists or the DB is unreachable, returns null.
 * Caches the database query using Next.js unstable_cache to prevent query latency on every layout/page request.
 */
export const getCurrentClub = unstable_cache(
  async () => {
    try {
      return await prisma.club.findFirst();
    } catch (err) {
      console.error("[getCurrentClub] DB error — returning null:", err);
      return null;
    }
  },
  ["current-club"],
  {
    tags: ["club"],
    revalidate: 3600
  }
);
