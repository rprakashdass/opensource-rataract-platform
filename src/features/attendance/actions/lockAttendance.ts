"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function toggleAttendanceLock(eventId: string, locked: boolean) {
    try {
        const session = await getSession();
        if (!session) return { error: "Unauthorized" };

        const isAuthorized = session.roles?.some((r: string) => 
            ["SUPER_ADMIN", "CLUB_ADMIN"].includes(r) // Events admin might not be allowed to lock? Let's allow EVENTS_ADMIN for now.
        );
        const hasFullAccess = session.roles?.some((r: string) => 
            ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN", "SECRETARY", "PRESIDENT"].includes(r) 
        );

        if (!hasFullAccess) return { error: "Permission denied." };

        await prisma.event.update({
            where: { id: eventId },
            data: { isAttendanceLocked: locked }
        });

        // Deactivate all active QR sessions for this event if locking
        if (locked) {
            await prisma.attendanceSession.updateMany({
                where: { eventId, active: true },
                data: { active: false }
            });
        }

        revalidatePath(`/admin/events/${eventId}/attendance`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to toggle lock" };
    }
}
