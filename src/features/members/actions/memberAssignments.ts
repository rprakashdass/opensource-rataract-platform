"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath, revalidateTag } from "next/cache";

export async function addPortfolioAssignment(memberId: string, data: { portfolioId: string, roleTitle: string, tenureYear: string }) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const assignment = await prisma.memberPortfolioAssignment.create({
      data: {
        memberId,
        portfolioId: data.portfolioId,
        roleTitle: data.roleTitle,
        tenureYear: data.tenureYear
      }
    });

    revalidatePath(`/admin/members/${memberId}`);
    revalidatePath("/about");
    return { success: true, assignment };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Assignment already exists for this portfolio in this year." };
    return { error: error.message || "Failed to add portfolio assignment" };
  }
}

export async function deletePortfolioAssignment(assignmentId: string, memberId: string) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    await prisma.memberPortfolioAssignment.delete({
      where: { id: assignmentId }
    });

    revalidatePath(`/admin/members/${memberId}`);
    revalidatePath("/about");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete assignment" };
  }
}

export async function addBoardRole(memberId: string, data: { roleId: string, financialYearId: string }) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const role = await prisma.clubRole.findUnique({ where: { id: data.roleId } });
    if (!role) return { error: "Role not found" };

    const boardMember = await prisma.boardMember.create({
      data: {
        clubId: club.id,
        memberId,
        roleId: data.roleId,
        financialYearId: data.financialYearId,
        position: role.name, // Fallback for backward compatibility
        order: role.displayOrder
      }
    });

    revalidatePath(`/admin/members/${memberId}`);
    revalidatePath("/about");
    revalidateTag("team", "max");
    return { success: true, boardMember };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Member already holds this role for the given year." };
    return { error: error.message || "Failed to add board role" };
  }
}

export async function deleteBoardRole(boardMemberId: string, memberId: string) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    await prisma.boardMember.delete({
      where: { id: boardMemberId }
    });

    revalidatePath(`/admin/members/${memberId}`);
    revalidatePath("/about");
    revalidateTag("team", "max");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete board role" };
  }
}
