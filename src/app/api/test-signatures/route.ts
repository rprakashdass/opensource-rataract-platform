import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import { getGoogleDriveDirectLink } from "@/lib/utils";

async function loadLogo(logoUrl?: string | null) {
  if (!logoUrl) return null;
  try {
    const res = await fetch(getGoogleDriveDirectLink(logoUrl));
    if (!res.ok) return { error: `Fetch failed: ${res.status}` };
    const type = res.headers.get("content-type") || "";
    const bytes = Buffer.from(await res.arrayBuffer());

    let format = "";
    if (type.includes("png")) format = "png";
    else if (type.includes("jpeg") || type.includes("jpg")) format = "jpg";
    else {
      // Any other format (WebP, etc.) — re-encode to PNG.
      try {
        await sharp(bytes).png().toBuffer();
        format = "png (converted from " + type + ")";
      } catch (e: any) {
        return { error: `Sharp conversion failed: ${e.message}` };
      }
    }
    return { success: true, url: logoUrl, type, format, byteLength: bytes.length };
  } catch (e: any) {
    return { error: `Exception: ${e.message}` };
  }
}

export async function GET() {
  const clubs = await prisma.club.findMany({
    include: { websiteSettings: true }
  });
  
  const results = [];
  for (const c of clubs) {
    if (c.websiteSettings?.presSignature) {
      const res = await loadLogo(c.websiteSettings.presSignature);
      results.push({ role: "pres", res });
    }
    if (c.websiteSettings?.treasSignature) {
      const res = await loadLogo(c.websiteSettings.treasSignature);
      results.push({ role: "treas", res });
    }
  }

  return NextResponse.json(results);
}
