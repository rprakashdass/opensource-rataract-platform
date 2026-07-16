import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Returns the single club instance for this self-hosted environment.
 * If no club exists, returns null.
 * Caches the database query using Next.js unstable_cache to prevent query latency on every layout/page request.
 */
export const getCurrentClub = unstable_cache(
  async () => {
    return await prisma.club.findFirst();
  },
  ["current-club"],
  {
    tags: ["club"],
    revalidate: 3600
  }
);
