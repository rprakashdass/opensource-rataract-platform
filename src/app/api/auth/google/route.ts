import { google } from "googleapis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/auth/google
 * Redirects the user to Google's OAuth consent screen.
 * The `redirect` search param is forwarded via OAuth `state` so the callback
 * can send the user to the right place after successful sign-in.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Google OAuth is not configured. CLIENT_ID / CLIENT_SECRET missing." },
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Forward the ?redirect= param through state so the callback can honour it
  const redirect = req.nextUrl.searchParams.get("redirect") || "";
  const state = Buffer.from(JSON.stringify({ redirect })).toString("base64");

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "online",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    prompt: "select_account",
    state,
  });

  return NextResponse.redirect(authUrl);
}
