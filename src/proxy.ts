import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth/session";

const PORTAL_PREFIXES = ["/admin", "/dashboard", "/member"];

// Ask the DB (via a tiny node-runtime API) whether the public site is live.
// Edge middleware can't touch Prisma directly, so we fetch. Fails closed
// (gated) so a hiccup never leaks an unfinished site before launch.
async function isSiteLive(origin: string): Promise<boolean> {
  try {
    const res = await fetch(`${origin}/api/site-status`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { live?: boolean };
    return data.live === true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;
  const isPortal = PORTAL_PREFIXES.some((p) => pathname.startsWith(p));

  // ── Portal (admin / member) — auth required ──
  if (isPortal) {
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const payload = await verifyJWT(sessionCookie);
    if (!payload) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin")) {
      const allowedRoles = ["SUPER_ADMIN", "ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN", "FINANCE_VIEWER", "EVENTS_ADMIN", "CONTENT_ADMIN"];
      const hasRole = payload.roles && payload.roles.some((r: string) => allowedRoles.includes(r));
      if (!hasRole) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  }

  // ── Public pages — launch gate ──
  // The public site is hidden behind /coming-soon until it goes live. Live is
  // decided by (1) env SITE_LIVE=true — a hard production override that skips
  // the DB entirely, then (2) the admin-controlled DB flag / scheduled time.
  // Logged-in users (board/admins) always bypass so they can preview & prep.
  if (process.env.SITE_LIVE !== "true") {
    const payload = sessionCookie ? await verifyJWT(sessionCookie) : null;
    if (!payload) {
      const live = await isSiteLive(request.nextUrl.origin);
      if (!live) {
        const url = request.nextUrl.clone();
        url.pathname = "/coming-soon";
        url.search = "";
        // Flag the rewrite so the root layout renders the teaser bare — no
        // public header/footer. (usePathname() still reports the original
        // path on a rewrite, so the client can't detect this on its own.)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-site-gated", "1");
        return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on every page request EXCEPT internals, assets, auth, the API, and the
  // teaser page itself (excluding /coming-soon avoids a rewrite loop; excluding
  // /auth keeps login reachable while gated so admins can sign in to preview).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|coming-soon|auth).*)",
  ],
};
