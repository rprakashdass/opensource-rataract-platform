"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteMember(id: string) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const member = await prisma.member.findUnique({
      where: { id, clubId: club.id },
      select: { userId: true }
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
    revalidateTag("team", "max"); revalidateTag("homepage", "max");
    revalidatePath("/team");
    revalidateTag("team", "max"); revalidateTag("homepage", "max");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete member:", error);
    return { error: error.message || "Failed to delete member" };
  }
}
