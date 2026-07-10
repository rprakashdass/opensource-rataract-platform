"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";

export async function exportAttendanceCsv(eventId: string) {
    try {
        const session = await getSession();
        if (!session || !canManageClub(session)) return { error: "Unauthorized" };

        const isAuthorized = session.roles?.some((r: string) => 
            ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN", "SECRETARY"].includes(r)
        );
        if (!isAuthorized) return { error: "Permission denied." };

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                attendance: {
                    include: { member: true }
                }
            }
        });

        if (!event) return { error: "Event not found" };

        let csv = "Name,Email,Phone,Status,Method,Check-In Time,Volunteer Hours\n";

        event.attendance.forEach(a => {
            const name = `"${a.member.name}"`;
            const email = `"${a.member.email || ""}"`;
            const phone = `"${a.member.phone || ""}"`;
            const status = a.status;
            const method = a.method;
            const time = a.checkedInAt.toISOString();
            const hours = a.volunteerHours ? a.volunteerHours.toString() : "0";

            csv += `${name},${email},${phone},${status},${method},${time},${hours}\n`;
        });

        return { success: true, csv, filename: `attendance_${event.slug}.csv` };
    } catch (error: any) {
        console.error("CSV export error:", error);
        return { error: error.message || "Failed to generate CSV" };
    }
}
