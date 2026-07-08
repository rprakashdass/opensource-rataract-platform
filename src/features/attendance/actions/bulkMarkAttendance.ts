"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";

export async function bulkMarkAttendance(
    eventId: string, 
    memberIds: string[],
    status: AttendanceStatus, 
    volunteerHours?: number | null
) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const isAuthorized = session.roles?.some((r: string) => 
      ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN", "PRESIDENT", "SECRETARY"].includes(r)
    );

    if (!isAuthorized) {
        return { error: "Permission denied. Only admins can mark attendance." };
    }

    // Check if event is locked
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { error: "Event not found" };
    if (event.isAttendanceLocked) return { error: "Attendance for this event is locked" };

    // Transaction for bulk upsert
    await prisma.$transaction(
        memberIds.map((memberId) => 
            prisma.attendance.upsert({
                where: {
                    eventId_memberId: { eventId, memberId }
                },
                update: {
                    status,
                    method: "MANUAL",
                    volunteerHours: volunteerHours ?? null,
                    markedById: session.id,
                    checkedInAt: new Date()
                },
                create: {
                    eventId,
                    memberId,
                    status,
                    method: "MANUAL",
                    volunteerHours: volunteerHours ?? null,
                    markedById: session.id
                }
            })
        )
    );

    revalidatePath(`/admin/events/${eventId}/attendance`);
    return { success: true };
  } catch (error: any) {
    console.error("Bulk mark attendance error:", error);
    return { error: error.message || "Failed to mark attendance" };
  }
}
