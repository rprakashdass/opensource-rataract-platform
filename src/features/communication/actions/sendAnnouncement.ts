"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { dispatchNotification } from "@/features/notifications/service";

export async function sendAnnouncement(id: string) {
  try {
    const session = await getSession();
    if (!session || !session.roles?.includes("ADMIN") && !session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("BOARD_MEMBER")) {
      return { error: "Unauthorized" };
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return { error: "Announcement not found" };
    }

    // Fetch members to send to based on type
    let userEmails: string[] = [];
    
    if (announcement.type === 'BOARD_MEETING') {
        const boardMembers = await prisma.boardMember.findMany({
            where: { clubId: announcement.clubId },
            include: { member: { include: { user: true } } }
        });
        userEmails = boardMembers.map(bm => bm.member.user?.email).filter(Boolean) as string[];
    } else {
        const members = await prisma.member.findMany({
            where: { clubId: announcement.clubId },
            include: { user: true }
        });
        userEmails = members.map(m => m.user?.email).filter(Boolean) as string[];
    }

    const recipientsCount = userEmails.length;
    
    console.log(`[Email Service] Triggering dispatch for "${announcement.emailSubject}" to ${recipientsCount} recipients.`);

    if (recipientsCount > 0) {
      await dispatchNotification({
        trigger: announcement.minutesContent ? "MINUTES_PUBLISHED" : "MEETING_CREATED",
        recipients: userEmails,
        announcementId: announcement.id,
        sendEmailFlag: true,
        attachCalendarFlag: true
      });
    }

    await prisma.announcement.update({
      where: { id },
      data: {
        sentAt: new Date(),
        status: "PUBLISHED",
        deliveryStatus: "SENT",
        recipientsCount: recipientsCount
      }
    });

    revalidatePath(`/admin/announcements`);
    revalidateTag("announcements", "max"); revalidateTag("homepage", "max");
    revalidatePath(`/admin/announcements/${id}`);
    revalidateTag("announcements", "max"); revalidateTag("homepage", "max");

    return { success: true };
  } catch (error: any) {
    console.error("Error sending announcement:", error);
    return { error: error.message || "Failed to send announcement" };
  }
}
