import { prisma } from "@/lib/prisma";

/**
 * Returns the single club instance for this self-hosted environment.
 * If no club exists, returns null.
 */
export async function getCurrentClub() {
  return await prisma.club.findFirst();
}
