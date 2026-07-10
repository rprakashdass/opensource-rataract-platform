import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";
import { getSession , canManageMembers } from "@/lib/auth/session";

function validateMemberPayload(data: any) {
  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new Error("Member name is required.");
  }
  if (typeof data.email !== "string" || !data.email.trim()) {
    throw new Error("Contact email is required.");
  }
  if (data.isBoard && (typeof data.position !== "string" || !data.position.trim())) {
    throw new Error("Board position is required when the member is a board member.");
  }

  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
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
    const session = await getSession();
    if (!session || !session.roles?.some((role: string) => ["SUPER_ADMIN", "CLUB_ADMIN"].includes(role))) {
      return NextResponse.json({ error: "Access Denied: Only Admins can create members" }, { status: 403 });
    }

    const data = await req.json();
    const payload = validateMemberPayload(data);
    const club = await getOrCreateDefaultClub();

    // Create User first
    const defaultPassword = payload.name.trim().toLowerCase().replace(/\s+/g, ".") + "@nexus"; // e.g. "john.doe@nexus"
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          password: defaultPassword, // Standard default password
          roles: ["MEMBER"]
        }
      });
    }

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        clubId: club.id,
        name: payload.name,
        email: payload.email,
        avatar: payload.avatar,
        phone: payload.phone,
        profession: payload.profession,
        bio: payload.bio,
      },
    });

    if (data.isBoard) {
      await prisma.boardMember.create({
        data: {
          memberId: member.id,
          clubId: club.id,
          position: payload.position,
          order: payload.order,
          financialYearId: (await prisma.financialYear.findFirst({ where: { status: "ACTIVE" } }))?.id || ""
        },
      });
    }

    return NextResponse.json(member);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.roles?.some((role: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN", "FINANCE_ADMIN"].includes(role))) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const members = await prisma.member.findMany({
      include: {
        user: true,
        boardMemberships: true,
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
    const session = await getSession();
    if (!session || !session.roles?.some((role: string) => ["SUPER_ADMIN", "CLUB_ADMIN"].includes(role))) {
      return NextResponse.json({ error: "Access Denied: Only Admins can delete members" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    const member = await prisma.member.findUnique({ where: { id } });
    if (member) {
      await prisma.member.delete({ where: { id } });
      // Also delete the associated user so the email can be reused
      if (member.userId) {
        await prisma.user.delete({ where: { id: member.userId } });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.roles?.some((role: string) => ["SUPER_ADMIN", "CLUB_ADMIN"].includes(role))) {
      return NextResponse.json({ error: "Access Denied: Only Admins can update members" }, { status: 403 });
    }

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

      // Update Member
      const member = await tx.member.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email?.trim().toLowerCase() || undefined,
          avatar: data.avatar || null,
          phone: data.phone,
          profession: data.profession,
          bio: data.bio,
        },
      });

      // Update User email if it changed
      if (existing.userId && data.email) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { email: data.email.trim().toLowerCase() }
        });
      }

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
