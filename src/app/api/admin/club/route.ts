import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

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
    return NextResponse.json(club);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown errors";
    return NextResponse.json({ error: message }, { status: 500 });
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
    revalidateTag("club", "max");
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
