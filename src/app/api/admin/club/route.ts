import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { handleApiError } from "@/lib/api-error";

export async function getOrCreateDefaultClub() {
  try {
    let club = await prisma.club.findFirst();
    if (!club) {
      const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Rotaract Club";
      club = await prisma.club.create({
        data: {
          name: appName,
          shortName: appName,
          district: null,
          email: null,
          description: null,
          tenureYear: "2026-27",
          foundedYear: new Date().getFullYear(),
          meetingDay: null,
          meetingTime: null,
          meetingVenue: null,
          presidentMessage: null,
        },
      });
    } else {
      const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim();
      if (appName && club.name !== appName) {
        club = await prisma.club.update({
          where: { id: club.id },
          data: { name: appName, shortName: appName }
        });
        revalidateTag("club", "max");
      }
    }
    return club;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown database error";
    throw new Error(`Unable to load club configuration: ${message}`);
  }
}

export async function GET() {
  try {
    const club = await getOrCreateDefaultClub();
    const settings = await prisma.websiteSettings.findUnique({ where: { clubId: club.id } });
    return NextResponse.json({ 
      ...club, 
      treasSignature: settings?.treasSignature ?? null,
      speakUpEmail: settings?.speakUpEmail ?? null
    });
  } catch (error: unknown) {
    return handleApiError(error, "Failed to load club configuration");
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const club = await getOrCreateDefaultClub();

    if (typeof data.name !== "string" || !data.name.trim()) {
      return NextResponse.json({ error: "Club name is required." }, { status: 400 });
    }

    const updated = await prisma.club.update({
      where: { id: club.id },
      data: {
        name: data.name.trim(),
        shortName: typeof data.shortName === "string" ? data.shortName.trim() : null,
        district: typeof data.district === "string" ? data.district.trim() : null,
        email: typeof data.email === "string" ? data.email.trim() : null,
        phone: typeof data.phone === "string" ? data.phone.trim() : null,
        description: typeof data.description === "string" ? data.description.trim() : null,
        missionStatement: typeof data.missionStatement === "string" ? data.missionStatement.trim() : null,
        visionStatement: typeof data.visionStatement === "string" ? data.visionStatement.trim() : null,
        presidentMessage: typeof data.presidentMessage === "string" ? data.presidentMessage.trim() : null,
        tenureYear:
          typeof data.tenureYear === "string" && data.tenureYear.trim()
            ? data.tenureYear.trim()
            : null,
        foundedYear: typeof data.foundedYear === "number" ? data.foundedYear : null,
        meetingDay: typeof data.meetingDay === "string" ? data.meetingDay.trim() : null,
        meetingTime: typeof data.meetingTime === "string" ? data.meetingTime.trim() : null,
        meetingVenue: typeof data.meetingVenue === "string" ? data.meetingVenue.trim() : null,
        primaryColor: typeof data.primaryColor === "string" ? data.primaryColor.trim() : undefined,
        socialMedia: data.socialMedia || undefined,
        logoUrl: typeof data.logoUrl === "string" ? data.logoUrl.trim() : null,
        bannerUrl: typeof data.bannerUrl === "string" ? data.bannerUrl.trim() : null,
        upiId: typeof data.upiId === "string" ? data.upiId.trim() : null,
        paymentQr: typeof data.paymentQr === "string" ? data.paymentQr.trim() : null,
      },
    });

    // Persist treasurer signature & speakUp email to WebsiteSettings
    if (typeof data.treasSignature === "string" || data.treasSignature === null || typeof data.speakUpEmail === "string" || data.speakUpEmail === null) {
      await prisma.websiteSettings.upsert({
        where: { clubId: club.id },
        create: { 
          clubId: club.id, 
          treasSignature: data.treasSignature?.trim() || null,
          speakUpEmail: data.speakUpEmail?.trim() || null
        },
        update: { 
          treasSignature: data.treasSignature !== undefined ? (data.treasSignature?.trim() || null) : undefined,
          speakUpEmail: data.speakUpEmail !== undefined ? (data.speakUpEmail?.trim() || null) : undefined
        },
      });
    }
    // Bust every cache that reads club data: getCurrentClub ("club") AND the
    // public layout/header, which caches under "layout"/"settings" — without
    // these the header keeps serving the old logo until the 1h revalidate.
    revalidateTag("club", "max");
    revalidateTag("layout", "max");
    revalidateTag("settings", "max");
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return handleApiError(error, "Failed to update club configuration");
  }
}
