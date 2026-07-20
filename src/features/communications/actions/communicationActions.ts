"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageMembers } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath } from "next/cache";
import { MailboxStatus, MailboxPriority, MailboxType } from "@prisma/client";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateCommunicationInput {
  subject: string;
  description: string;
  priority?: MailboxPriority;
  type?: MailboxType;
  attachmentUrl?: string;
}

export interface UpdateCommunicationStatusInput {
  id: string;
  status: MailboxStatus;
  adminNotes?: string;
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Member creates a new communication (complaint, excuse, etc.)
 */
export async function createCommunication(data: CreateCommunicationInput) {
  try {
    const session = await getSession();
    if (!session || !session.member?.id) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const sanitize = (str: string) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const comm = await prisma.memberCommunication.create({
      data: {
        clubId: club.id,
        memberId: session.member.id,
        subject: sanitize(data.subject),
        description: sanitize(data.description),
        priority: data.priority || "MEDIUM",
        type: data.type || "COMPLAINT",
        status: "OPEN",
        attachmentUrl: data.attachmentUrl
      }
    });

    // Send email to President
    const president = await prisma.boardMember.findFirst({
      where: { 
        clubId: club.id, 
        position: { equals: "President", mode: "insensitive" } 
      },
      include: { member: { include: { user: true } } }
    });

    if (president?.member?.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Message in Club Mailbox</h2>
          <p><strong>From:</strong> ${session.member.name || session.user?.name || "A member"}</p>
          <p><strong>Type:</strong> ${data.type || "COMPLAINT"}</p>
          <p><strong>Priority:</strong> ${data.priority || "MEDIUM"}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <hr />
          <p style="white-space: pre-wrap;">${data.description}</p>
          ${data.attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${data.attachmentUrl}">View File</a></p>` : ""}
          <hr />
          <p style="color: #666; font-size: 12px;">This is an automated notification from ${club.name}.</p>
        </div>
      `;

      await sendEmail({
        to: president.member.email,
        subject: `[Mailbox] ${data.subject}`,
        html: emailHtml,
      });
    }

    revalidatePath("/dashboard/mailbox");
    revalidatePath("/admin/mailbox");

    return { success: true, data: comm };
  } catch (error: any) {
    console.error("Failed to create communication:", error);
    return { error: "Failed to create communication" };
  }
}

/**
 * Admin fetches all communications for their club
 */
export async function getClubCommunications() {
  try {
    const session = await getSession();
    if (!session || !canManageMembers(session)) {
      return { error: "Unauthorized", data: [] };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found", data: [] };

    const comms = await prisma.memberCommunication.findMany({
      where: { clubId: club.id },
      include: {
        member: {
          select: { name: true, email: true, avatar: true }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return { success: true, data: comms };
  } catch (error: any) {
    console.error("Failed to fetch communications:", error);
    return { error: "Failed to load communications", data: [] };
  }
}

/**
 * Admin updates a communication's status
 */
export async function updateCommunicationStatus(data: UpdateCommunicationStatusInput) {
  try {
    const session = await getSession();
    if (!session || !canManageMembers(session)) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    // Verify the communication belongs to their club
    const existing = await prisma.memberCommunication.findUnique({
      where: { id: data.id, clubId: club.id }
    });

    if (!existing) {
      return { error: "Communication not found or unauthorized." };
    }

    const updateData: any = {
      status: data.status,
      statusUpdatedAt: new Date(),
    };

    if (data.adminNotes !== undefined) {
      updateData.adminNotes = data.adminNotes;
    }

    if (data.status === "RESOLVED" || data.status === "CLOSED") {
      updateData.resolvedAt = new Date();
      updateData.resolvedById = session.userId;
    } else {
      updateData.resolvedAt = null;
      updateData.resolvedById = null;
    }

    const comm = await prisma.memberCommunication.update({
      where: { id: data.id },
      data: updateData
    });

    revalidatePath("/dashboard/mailbox");
    revalidatePath("/admin/mailbox");

    return { success: true, data: comm };
  } catch (error: any) {
    console.error("Failed to update communication:", error);
    return { error: "Failed to update communication" };
  }
}

/**
 * Admin deletes a communication
 */
export async function deleteCommunication(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageMembers(session)) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const existing = await prisma.memberCommunication.findUnique({
      where: { id, clubId: club.id }
    });

    if (!existing) {
      return { error: "Communication not found or unauthorized." };
    }

    await prisma.memberCommunication.delete({
      where: { id },
    });

    revalidatePath("/dashboard/mailbox");
    revalidatePath("/admin/mailbox");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete communication:", error);
    return { error: "Failed to delete communication" };
  }
}
