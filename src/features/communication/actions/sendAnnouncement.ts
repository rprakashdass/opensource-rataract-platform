"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageCommunication } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { dispatchNotification } from "@/features/notifications/service";

export async function sendAnnouncement(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageCommunication(session)) { return { error: "Unauthorized" }; }

    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return { error: "Announcement not found" };
    }

    // Fetch recipients to send to based on Visibility rules
    let userEmails: string[] = [];

    if (announcement.visibility === "BOARD_ONLY") {
      const boardMembers = await prisma.boardMember.findMany({
        where: { clubId: announcement.clubId },
        include: { member: { include: { user: true } } }
      });
      userEmails = boardMembers.map(bm => bm.member.user?.email).filter(Boolean) as string[];
    } else if (announcement.visibility === "MEMBERS_ONLY") {
      const members = await prisma.member.findMany({
        where: { clubId: announcement.clubId },
        include: { user: true }
      });
      userEmails = members.map(m => m.user?.email).filter(Boolean) as string[];
    } else if (announcement.visibility === "SPECIFIC_MEMBERS") {
      const members = await prisma.member.findMany({
        where: { id: { in: announcement.specificRecipientIds } },
        include: { user: true }
      });
      userEmails = members.map(m => m.user?.email).filter(Boolean) as string[];
    } else {
      // For PUBLIC or INTERNAL: Send to both Board and General members
      const [boardMembers, members] = await Promise.all([
        prisma.boardMember.findMany({
          where: { clubId: announcement.clubId },
          include: { member: { include: { user: true } } }
        }),
        prisma.member.findMany({
          where: { clubId: announcement.clubId },
          include: { user: true }
        })
      ]);
      const emailsSet = new Set<string>();
      boardMembers.forEach(bm => { if (bm.member.user?.email) emailsSet.add(bm.member.user.email); });
      members.forEach(m => { if (m.user?.email) emailsSet.add(m.user.email); });
      userEmails = Array.from(emailsSet);
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
