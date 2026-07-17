"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageMembers } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

export async function createMember(data: any) {
  try {
    const session = await getSession();
    if (!session || !canManageMembers(session)) return { error: "Unauthorized" };

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

    const regexPattern = process.env.DEFAULT_PASSWORD_REGEX || "\\s+";
    const replaceValue = process.env.DEFAULT_PASSWORD_REPLACE !== undefined ? process.env.DEFAULT_PASSWORD_REPLACE : ".";
    const nameRegex = new RegExp(regexPattern, "g");
    const formattedName = data.name.trim().toLowerCase().replace(nameRegex, replaceValue);
    const suffix = process.env.DEFAULT_PASSWORD_SUFFIX || "@nexus";
    const defaultPassword = formattedName + suffix;

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
                avatar: data.avatar || null,
                bloodGroup: data.bloodGroup || null,
                emergencyContact: data.emergencyContact || null,
                location: data.location || null,
                bio: data.bio || null,
                skills: data.skills || [],
                membershipStatus: data.membershipStatus || "ACTIVE",
                joinedAt: data.joinedAt ? new Date(data.joinedAt) : new Date(),
            }
        });

        // Handle Board Roles (Designations) — chosen from the club's configured roles
        const roleIds = data.roleIds || (data.roleId ? [data.roleId] : []);
        if (roleIds.length > 0) {
            const activeYear = await tx.financialYear.findFirst({
                where: { clubId, status: "ACTIVE" }
            });
            if (activeYear) {
                const roles = await tx.clubRole.findMany({
                    where: { id: { in: roleIds } }
                });
                for (const role of roles) {
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
    revalidatePublicRoutes();
    return { success: true, member: result };
  } catch (error: any) {
    console.error("Create member error:", error);
    return { error: error.message || "Failed to create member" };
  }
}
