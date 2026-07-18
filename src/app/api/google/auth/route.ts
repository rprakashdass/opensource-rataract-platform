import { NextResponse } from "next/server";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { getOAuth2Client } from "@/features/storage/google-drive/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oauth2Client = getOAuth2Client();

    const scopes = [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email"
    ];

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Force consent to ensure we get a refresh token
      scope: scopes,
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (error: any) {
    console.error("Failed to generate Google Auth URL:", error);
    return NextResponse.json({ error: "Failed to initialize OAuth flow" }, { status: 500 });
  }
}
