"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageMembers, canManageWebsite } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type ComplaintStatus = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus,
  adminNote?: string
) {
  try {
    const session = await getSession();
    if (!session || (!canManageMembers(session) && !canManageWebsite(session))) {
      return { error: "Unauthorized" };
    }

    await prisma.anonComplaint.update({
      where: { id },
      data: {
        status,
        ...(adminNote !== undefined ? { adminNote: adminNote.trim() || null } : {}),
      },
    });

    revalidatePath("/admin/complaints");
    revalidatePath("/admin/mailbox");
    return { success: true };
  } catch (error: any) {
    console.error("[updateComplaintStatus] Error:", error);
    return { error: error.message || "Failed to update complaint" };
  }
}
