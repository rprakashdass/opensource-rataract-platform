import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";

// Public launch status, consulted by the middleware gate (proxy.ts) on every
// anonymous public request while the site is pre-launch. Kept tiny + node
// runtime so Prisma works; the gate short-circuits on env SITE_LIVE=true so
// this is only hit during the scheduled/testing window.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const club = await getCurrentClub();
    if (!club) return NextResponse.json({ live: false, launchAt: null });

    const settings = await prisma.websiteSettings.findUnique({
      where: { clubId: club.id },
      select: { siteLive: true, launchAt: true },
    });

    const launchAt = settings?.launchAt ?? null;
    const scheduledPassed = !!launchAt && launchAt.getTime() <= Date.now();
    const live = !!settings?.siteLive || scheduledPassed;

    return NextResponse.json(
      { live, launchAt: launchAt ? launchAt.toISOString() : null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[site-status] error:", err);
    // Fail closed: if we can't confirm the site is live, keep it gated.
    return NextResponse.json({ live: false, launchAt: null });
  }
}
