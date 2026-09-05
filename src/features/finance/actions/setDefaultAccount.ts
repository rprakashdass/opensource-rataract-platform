"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageFinance } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

/**
 * Marks one account as the default — the account self-submitted member
 * payments get credited to on approval, since members always pay into the
 * one official UPI/bank account (there's no per-payment account choice on
 * their end, unlike admin-recorded direct payments).
 */
export async function setDefaultAccount(accountId: string) {
  const session = await getSession();
  if (!session || !canManageFinance(session)) return { error: "Unauthorized" };

  try {
    const account = await prisma.account.findUnique({ where: { id: accountId }, select: { clubId: true } });
    if (!account) return { error: "Account not found" };

    await prisma.$transaction([
      prisma.account.updateMany({ where: { clubId: account.clubId, isDefault: true }, data: { isDefault: false } }),
      prisma.account.update({ where: { id: accountId }, data: { isDefault: true } }),
    ]);

    revalidatePath("/admin/finance");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to set default account:", error);
    return { error: error.message || "Failed to set default account" };
  }
}
