import { NextResponse } from "next/server";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getOAuth2Client } from "@/features/storage/google-drive/auth";
import { encrypt, decrypt } from "@/lib/crypto";
import { google } from "googleapis";
import { GoogleDriveProvider } from "@/features/storage/google-drive";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !canManageWebsite(session)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  const settingsUrl = new URL("/admin/settings/integrations/google-drive", request.url);

  if (error) {
    settingsUrl.searchParams.set("error", error);
    return NextResponse.redirect(settingsUrl);
  }

  if (!code) {
    settingsUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    const email = userInfo.data.email;
    
    const club = await prisma.club.findFirst();
    if (!club) throw new Error("Club not found");

    let finalRefreshToken = tokens.refresh_token;
    let clearToken = finalRefreshToken;
    
    if (!finalRefreshToken) {
      if (club.googleDriveRefreshToken) {
         clearToken = decrypt(club.googleDriveRefreshToken);
      } else {
         settingsUrl.searchParams.set("error", "no_refresh_token");
         return NextResponse.redirect(settingsUrl);
      }
    } else {
      finalRefreshToken = encrypt(finalRefreshToken);
    }
    
    let rootFolderId = club.googleDriveRootFolderId;
    if (clearToken) {
      const provider = new GoogleDriveProvider(clearToken);
      rootFolderId = await provider.setupRootFolder();
    }

    await prisma.club.update({
      where: { id: club.id },
      data: {
        googleDriveEmail: email,
        googleDriveConnectedAt: new Date(),
        googleDriveConnectedById: session.user.id,
        ...(finalRefreshToken && { googleDriveRefreshToken: finalRefreshToken }),
        ...(rootFolderId && { googleDriveRootFolderId: rootFolderId }),
      }
    });

    settingsUrl.searchParams.set("success", "1");
    return NextResponse.redirect(settingsUrl);

  } catch (err: any) {
    console.error("OAuth Callback Error:", err);
    settingsUrl.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(settingsUrl);
  }
}
