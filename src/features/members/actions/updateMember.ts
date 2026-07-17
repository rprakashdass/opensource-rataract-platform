"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageMembers } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function updateMember(id: string, data: any) {
  try {
    const session = await getSession();
    if (!session || !canManageMembers(session)) { return { error: "Unauthorized" }; }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const existing = await prisma.member.findUnique({
      where: { id },
      select: { clubId: true }
    });

    if (!existing) {
      return { error: "Member not found" };
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        bloodGroup: data.bloodGroup,
        emergencyContact: data.emergencyContact,
        profession: data.profession,
        location: data.location,
        avatar: data.avatar,
        joinedAt: new Date(data.joinedAt),
      }
    });

    revalidatePath("/admin/members");
    revalidatePath(`/admin/members/${id}`);
    revalidatePublicRoutes();

    return { success: true, member };
  } catch (error: any) {
    console.error("Failed to update member:", error);
    return { error: error.message || "Failed to update member" };
  }
}
