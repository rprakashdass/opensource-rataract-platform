"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

export async function createMember(data: any) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const isAuthorized = session.roles?.some((r: string) => 
      ["SUPER_ADMIN", "CLUB_ADMIN", "PRESIDENT", "SECRETARY"].includes(r)
    );

    if (!isAuthorized) {
        return { error: "Permission denied. Only admins can create members." };
    }

    const memberData = await prisma.member.findUnique({
        where: { id: session.member?.id || "" }
    });
    
    // Fallback for admins without member records
    let clubId = memberData?.clubId;
    if (!clubId) {
        const defaultClub = await getOrCreateDefaultClub();
        clubId = defaultClub?.id;
    }
    
    if (!clubId) return { error: "Club association not found" };

    // Basic validation
    if (!data.name || !data.email) {
        return { error: "Name and email are required" };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    });
    if (existingUser) {
        return { error: "A user with this email already exists" };
    }

    const defaultPassword = data.name.trim().toLowerCase().replace(/\s+/g, ".") + "@nexus";

    const result = await prisma.$transaction(async (tx) => {
        // 1. Create User account (with default MEMBER role)
        const user = await tx.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: defaultPassword, // e.g. "john.doe@nexus"
                roles: ["MEMBER"],
                isActive: true,
            }
        });

        // 2. Create Member profile linked to User
        const newMember = await tx.member.create({
            data: {
                userId: user.id,
                clubId,
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                profession: data.profession || null,
                bloodGroup: data.bloodGroup || null,
                emergencyContact: data.emergencyContact || null,
                location: data.location || null,
                bio: data.bio || null,
                skills: data.skills || [],
                membershipStatus: data.membershipStatus || "ACTIVE",
                joinedAt: data.joinedAt ? new Date(data.joinedAt) : new Date(),
            }
        });

        // Handle Board Role (Designation) — chosen from the club's configured roles
        if (data.roleId) {
            const role = await tx.clubRole.findUnique({ where: { id: data.roleId } });
            const activeYear = await tx.financialYear.findFirst({
                where: { clubId, status: "ACTIVE" }
            });
            if (role && activeYear) {
                await tx.boardMember.create({
                    data: {
                        clubId,
                        memberId: newMember.id,
                        financialYearId: activeYear.id,
                        roleId: role.id,
                        position: role.name,
                        order: role.displayOrder,
                    }
                });
            }
        }

        // 3. Audit Log
        await tx.auditLog.create({
            data: {
                userId: session.id,
                action: "create_member",
                entity: "member",
                entityId: newMember.id,
                changes: JSON.stringify({ name: data.name, email: data.email })
            }
        });

        return newMember;
    });

    revalidatePath("/admin/members");
    revalidateTag("team", "max"); revalidateTag("homepage", "max");
    return { success: true, member: result };
  } catch (error: any) {
    console.error("Create member error:", error);
    return { error: error.message || "Failed to create member" };
  }
}
