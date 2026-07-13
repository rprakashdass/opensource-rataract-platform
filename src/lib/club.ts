import { prisma } from "@/lib/prisma";
import { cache } from "react";

/**
 * Returns the single club instance for this self-hosted environment.
 * If no club exists, returns null.
 * React cache is used to deduplicate queries across multiple layouts/pages in the same request.
 */
export const getCurrentClub = cache(async () => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim();
  if (appName) {
    const club = await prisma.club.findFirst({
      where: { name: appName }
    });
    if (club) return club;
  }
  return await prisma.club.findFirst();
});
