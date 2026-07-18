"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageWebsite } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatus(id: string, status: "PENDING" | "CONTACTED" | "CONVERTED" | "REJECTED" | "REVIEWING", type: "MEMBERSHIP" | "PARTNER" = "MEMBERSHIP") {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) { return { error: "Unauthorized" }; }

    let inquiry;
    if (type === "PARTNER") {
      inquiry = await prisma.partnerInquiry.update({
        where: { id },
        data: { status }
      });
    } else {
      inquiry = await prisma.membershipInquiry.update({
        where: { id },
        data: { status }
      });
    }

    if (status === "CONVERTED" && type === "MEMBERSHIP") {
      // Create user and member records if approved
      // In a real app we'd email them a magic link or temporary password.
      const existingUser = await prisma.user.findUnique({ where: { email: inquiry.email } });
      let user = existingUser;

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: inquiry.email,
            name: inquiry.name,
            password: Math.random().toString(36).slice(-8), // Dummy password since magic links will be used
            roles: ["MEMBER"]
          }
        });
      }

      const existingMember = await prisma.member.findUnique({ where: { userId: user.id } });
      if (!existingMember) {
        await prisma.member.create({
          data: {
            clubId: inquiry.clubId,
            userId: user.id,
            name: inquiry.name,
            email: inquiry.email,
            phone: (inquiry as any).phone || null,
            isActive: true,
          }
        });
      }
    }

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin/members");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update inquiry" };
  }
}
