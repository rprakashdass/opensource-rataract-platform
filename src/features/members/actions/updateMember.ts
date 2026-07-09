"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateMember(id: string, data: any) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const member = await prisma.member.update({
      where: { id, clubId: club.id },
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
    revalidateTag("team", "max"); revalidateTag("homepage", "max");
    revalidatePath(`/admin/members/${id}`);
    revalidateTag("team", "max"); revalidateTag("homepage", "max");
    revalidatePath("/team");
    revalidateTag("team", "max"); revalidateTag("homepage", "max");

    return { success: true, member };
  } catch (error: any) {
    console.error("Failed to update member:", error);
    return { error: error.message || "Failed to update member" };
  }
}
