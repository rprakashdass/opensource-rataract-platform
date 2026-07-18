import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAnnouncementHtml } from "@/lib/email-templates";
import { getSession, canManageClub } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !canManageClub(session)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const club = await getCurrentClub();
  if (!club) return new NextResponse("Club not found", { status: 404 });

  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement || announcement.clubId !== club.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const html = getAnnouncementHtml(announcement, club);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Prevent the preview from navigating away
      "Content-Security-Policy": "default-src 'self' 'unsafe-inline'; img-src *; navigate-to 'none'",
    },
  });
}
