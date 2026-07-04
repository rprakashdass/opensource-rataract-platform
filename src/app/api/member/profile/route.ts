import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();
    const { phone, profession, companyName, location, bio, bloodGroup } = payload;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { member: true }
    });

    if (!user || !user.member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    const updatedMember = await prisma.member.update({
      where: { id: user.member.id },
      data: {
        phone,
        profession,
        companyName,
        location,
        bio,
        bloodGroup
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
