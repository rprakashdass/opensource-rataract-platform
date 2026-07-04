import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";

function validateMemberPayload(data: any) {
  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new Error("Member name is required.");
  }
  if (typeof data.email !== "string" || !data.email.trim()) {
    throw new Error("Member email is required.");
  }
  if (typeof data.password !== "string" || !data.password.trim()) {
    throw new Error("Member password is required.");
  }
  if (data.isBoard && (typeof data.position !== "string" || !data.position.trim())) {
    throw new Error("Board position is required when the member is a board member.");
  }

  return {
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
    role: typeof data.role === "string" && data.role.trim() ? data.role.trim().toUpperCase() : "MEMBER",
    phone: typeof data.phone === "string" && data.phone.trim() ? data.phone.trim() : null,
    profession: typeof data.profession === "string" && data.profession.trim() ? data.profession.trim() : null,
    bio: typeof data.bio === "string" && data.bio.trim() ? data.bio.trim() : null,
    avatar: typeof data.avatar === "string" && data.avatar.trim() ? data.avatar.trim() : null,
    position: typeof data.position === "string" && data.position.trim() ? data.position.trim() : null,
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 1,
  };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const payload = validateMemberPayload(data);
    const club = await getOrCreateDefaultClub();

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: payload.email,
          password: payload.password,
          name: payload.name,
          avatar: payload.avatar,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          clubId: club.id,
          role: payload.role,
          phone: payload.phone,
          profession: payload.profession,
          bio: payload.bio,
        },
      });

      if (data.isBoard) {
        await tx.boardMember.create({
          data: {
            memberId: member.id,
            clubId: club.id,
            position: payload.position,
            order: payload.order,
          },
        });
      }

      return member;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        user: true,
        boardMembership: true,
      },
    });
    return NextResponse.json(members);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    const member = await prisma.member.findUnique({ where: { id } });
    if (member) {
      await prisma.user.delete({ where: { id: member.userId } });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
