"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

import { AttendanceStatus } from "@prisma/client";

export async function markAttendance(eventId: string, memberId: string, status: AttendanceStatus, volunteerHours?: number) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) return { error: "Unauthorized" };

    const isAuthorized = session.roles?.some((r: string) => 
      ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN", "PRESIDENT", "SECRETARY"].includes(r)
    );

    if (!isAuthorized) {
        return { error: "Permission denied. Only admins can mark attendance." };
    }

    // Upsert attendance record
    const attendance = await prisma.attendance.upsert({
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
    });

    revalidatePath(`/admin/events/${eventId}/attendance`);
    return { success: true, attendance };
  } catch (error: any) {
    console.error("Mark attendance error:", error);
    return { error: error.message || "Failed to mark attendance" };
  }
}
