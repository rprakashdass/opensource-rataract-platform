import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { userId: session.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    const data = await req.json();

    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: {
        phone: data.phone,
        bloodGroup: data.bloodGroup,
        profession: data.profession,
        companyName: data.companyName,
        location: data.location,
        bio: data.bio,
        websiteQuote: data.websiteQuote,
        avatar: data.avatar,
        skills: data.skills,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
