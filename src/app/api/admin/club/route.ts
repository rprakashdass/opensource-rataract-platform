import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultClubFallback = {
  id: "fallback-id",
  name: "Rotaract Platform",
  district: "District 3011",
  email: "contact@rotaractplatform.org",
  description: "Standard community service platform",
  tenureYear: "2026-27"
};

export async function getOrCreateDefaultClub() {
  try {
    let club = await prisma.club.findFirst();
    if (!club) {
      club = await prisma.club.create({
        data: {
          name: process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform",
          district: "District 3011",
          email: "contact@rotaractplatform.org",
          description: "Standard community service platform",
        },
      });
    }
    return club;
  } catch (err) {
    console.warn("DB connection failed in getOrCreateDefaultClub, using fallback:", err);
    return defaultClubFallback;
  }
}

export async function GET() {
  try {
    const club = await getOrCreateDefaultClub();
    return NextResponse.json(club);
  } catch (error: any) {
    console.warn("GET club failed, using fallback:", error.message);
    return NextResponse.json(defaultClubFallback);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const club = await getOrCreateDefaultClub();
    const updated = await prisma.club.update({
      where: { id: club.id },
      data: {
        name: data.name,
        district: data.district,
        email: data.email,
        description: data.description,
        tenureYear: data.tenureYear,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
