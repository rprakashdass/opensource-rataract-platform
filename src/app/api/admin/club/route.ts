import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getRequiredAppName() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim();
  if (!appName) {
    throw new Error("NEXT_PUBLIC_APP_NAME is required.");
  }
  return appName;
}

export async function getOrCreateDefaultClub() {
  const appName = getRequiredAppName();

  try {
    let club = await prisma.club.findFirst();
    if (!club) {
      club = await prisma.club.create({
        data: {
          name: appName,
          district: null,
          email: null,
          description: null,
          tenureYear: "2026-27",
        },
      });
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
        district: typeof data.district === "string" ? data.district.trim() : null,
        email: typeof data.email === "string" ? data.email.trim() : null,
        description: typeof data.description === "string" ? data.description.trim() : null,
        tenureYear:
          typeof data.tenureYear === "string" && data.tenureYear.trim()
            ? data.tenureYear.trim()
            : null,
      },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
