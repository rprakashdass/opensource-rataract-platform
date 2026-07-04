import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const club = await getOrCreateDefaultClub();

    // Create a transaction to create User and Member
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email || `${Math.random()}@example.com`,
          password: "temporarypassword", // Placeholder
          name: data.name,
          avatar: data.avatar || "/user.png",
        },
      });

      // 2. Create Member
      const member = await tx.member.create({
        data: {
          userId: user.id,
          clubId: club.id,
          role: data.role || "MEMBER",
          phone: data.phone,
          profession: data.profession,
          bio: data.bio,
        },
      });

      // 3. Create BoardMember details if specified
      if (data.isBoard) {
        await tx.boardMember.create({
          data: {
            memberId: member.id,
            clubId: club.id,
            position: data.position || "Director",
            order: Number(data.order) || 1,
          },
        });
      }

      return member;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Prisma error in admin members API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    console.warn("Failed to fetch members from DB, returning empty fallback:", error.message);
    return NextResponse.json([]);
  }
}
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    // Delete member and cascade deletes user
    const member = await prisma.member.findUnique({ where: { id } });
    if (member) {
      await prisma.user.delete({ where: { id: member.userId } });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id } = data;
    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const club = await getOrCreateDefaultClub();

    const result = await prisma.$transaction(async (tx: any) => {
      const existing = await tx.member.findUnique({
        where: { id },
        include: { boardMembership: true },
      });
      if (!existing) {
        throw new Error("Member not found");
      }

      // 1. Update User
      await tx.user.update({
        where: { id: existing.userId },
        data: {
          name: data.name,
          email: data.email,
          avatar: data.avatar || "/user.png",
        },
      });

      // 2. Update Member
      const member = await tx.member.update({
        where: { id },
        data: {
          role: data.role || "MEMBER",
          phone: data.phone,
          profession: data.profession,
          bio: data.bio,
        },
      });

      // 3. Update/Create/Delete BoardMember
      if (data.isBoard) {
        if (existing.boardMembership) {
          await tx.boardMember.update({
            where: { id: existing.boardMembership.id },
            data: {
              position: data.position || "Director",
              order: Number(data.order) || 1,
            },
          });
        } else {
          await tx.boardMember.create({
            data: {
              memberId: id,
              clubId: club.id,
              position: data.position || "Director",
              order: Number(data.order) || 1,
            },
          });
        }
      } else {
        if (existing.boardMembership) {
          await tx.boardMember.delete({
            where: { id: existing.boardMembership.id },
          });
        }
      }

      return member;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Prisma error in admin members PUT API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
