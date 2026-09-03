import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const RETRY_DELAYS_MS = [200, 500];

/**
 * Returns the single club instance for this self-hosted environment.
 * Retries transient DB errors (e.g. pool contention) before giving up, so a
 * brief connection blip doesn't get mistaken for "no club configured."
 * Only a successful result is cached — a thrown error is never cached, so
 * the next request retries against the DB immediately instead of being
 * stuck behind a stale failure for the full revalidate window.
 */
export const getCurrentClub = unstable_cache(
  async () => {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        return await prisma.club.findFirst();
      } catch (err) {
        lastErr = err;
        console.error(`[getCurrentClub] attempt ${attempt + 1} failed:`, err);
        const delay = RETRY_DELAYS_MS[attempt];
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastErr;
  },
  ["current-club"],
  {
    tags: ["club"],
    revalidate: 3600
  }
);
