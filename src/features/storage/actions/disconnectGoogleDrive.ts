"use server";

import { getSession, canManageWebsite } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function disconnectGoogleDrive() {
  const session = await getSession();
  if (!session || !canManageWebsite(session)) {
    return { error: "Unauthorized" };
  }

  const club = await prisma.club.findFirst();
  if (!club) return { error: "Club not found" };

  await prisma.club.update({
    where: { id: club.id },
    data: {
      googleDriveEmail: null,
      googleDriveRefreshToken: null,
      // We intentionally do not nullify googleDriveRootFolderId to preserve folder context
    }
  });

  revalidatePath("/admin/settings/integrations/google-drive");
  return { success: true };
}
