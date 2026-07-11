import { prisma } from "@/lib/prisma";
import { cache } from "react";

/**
 * Returns the single club instance for this self-hosted environment.
 * If no club exists, returns null.
 * React cache is used to deduplicate queries across multiple layouts/pages in the same request.
 */
export const getCurrentClub = cache(async () => {
  return await prisma.club.findFirst();
});
