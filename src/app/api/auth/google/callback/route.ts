import { google } from "googleapis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

/**
 * GET /api/auth/google/callback
 * Handles the OAuth redirect from Google. Exchanges the authorization code for
 * tokens, fetches the user's Google profile, looks up the email in our User
 * table, and if found creates a JWT session and redirects to the dashboard.
 *
 * Access is denied when the Google email is not registered in the platform.
 * This ensures the portal stays private — only members added by an admin can log in.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const code = req.nextUrl.searchParams.get("code");
  const rawState = req.nextUrl.searchParams.get("state") || "";
  const errorParam = req.nextUrl.searchParams.get("error");

  // User cancelled the consent screen
  if (errorParam) {
    return NextResponse.redirect(`${baseUrl}${ROUTES.LOGIN}?error=google_cancelled`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}${ROUTES.LOGIN}?error=google_no_code`);
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}${ROUTES.LOGIN}?error=google_not_configured`);
  }

  try {
    // Decode the forwarded redirect path from state
    let redirectPath = ROUTES.DASHBOARD;
    try {
      const stateData = JSON.parse(Buffer.from(rawState, "base64").toString("utf-8"));
      if (stateData.redirect) redirectPath = stateData.redirect;
    } catch {
      // state was invalid / tampered — use default
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Exchange authorization code for access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch the user's Google profile
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    const googleEmail = profile.email?.toLowerCase();
    const googleName = profile.name || "";

    if (!googleEmail) {
      return NextResponse.redirect(`${baseUrl}${ROUTES.LOGIN}?error=google_no_email`);
    }

    // Look up the email in our User table
    const user = await prisma.user.findUnique({
      where: { email: googleEmail },
    });

    if (!user) {
      // Email not registered on the platform — deny access
      return NextResponse.redirect(
        `${baseUrl}${ROUTES.LOGIN}?error=google_not_registered`
      );
    }

    if (!user.isActive) {
      return NextResponse.redirect(`${baseUrl}${ROUTES.LOGIN}?error=account_inactive`);
    }

    // Update lastLogin timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const roles = user.roles && user.roles.length > 0 ? user.roles : ["MEMBER"];

    // Create the session (same JWT cookie as credential login)
    await setSession({
      id: user.id,
      email: user.email,
      name: user.name || googleName,
      roles,
    });

    return NextResponse.redirect(`${baseUrl}${redirectPath}`);
  } catch (err) {
    console.error("[Google OAuth callback] Error:", err);
    return NextResponse.redirect(`${baseUrl}${ROUTES.LOGIN}?error=google_failed`);
  }
}
