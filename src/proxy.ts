import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const payload = await verifyJWT(sessionCookie);
  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
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

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
