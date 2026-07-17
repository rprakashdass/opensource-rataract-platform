"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageMembers } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function deleteMember(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageMembers(session)) { return { error: "Unauthorized" }; }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const member = await prisma.member.findUnique({
      where: { id },
      select: { userId: true, clubId: true }
    });

    if (!member) {
      return { error: "Member not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.member.delete({
        where: { id }
      });
      
      if (member.userId) {
        await tx.user.delete({
          where: { id: member.userId }
        });
      }
    });

    revalidatePath("/admin/members");
    revalidatePublicRoutes();

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete member:", error);
    return { error: error.message || "Failed to delete member" };
  }
}
