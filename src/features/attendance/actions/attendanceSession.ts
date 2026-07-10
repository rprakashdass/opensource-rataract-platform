"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// Generate a new Attendance Session (QR token)
export async function generateAttendanceSession(eventId: string, validityMinutes: number = 60) {
    try {
        const session = await getSession();
        if (!session || !canManageClub(session)) return { error: "Unauthorized" };

        const isAuthorized = session.roles?.some((r: string) => 
            ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN"].includes(r)
        );
        if (!isAuthorized) return { error: "Permission denied." };

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return { error: "Event not found" };
        if (event.isAttendanceLocked) return { error: "Attendance for this event is locked" };

        // Generate a random secure token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

        // Generate a random 6-digit PIN
        const checkInCode = Math.floor(100000 + Math.random() * 900000).toString();
        const checkInCodeHash = crypto.createHash("sha256").update(checkInCode).digest("hex");

        const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);

        const newSession = await prisma.attendanceSession.create({
            data: {
                eventId,
                tokenHash,
                checkInCodeHash,
                startsAt: new Date(),
                expiresAt,
                createdById: session.id,
                active: true
            }
        });

        revalidatePath(`/admin/events/${eventId}/attendance`);
        
        // Return the RAW token and code to the client so they can display it.
        // We only store the hash in the DB.
        return { success: true, token: rawToken, checkInCode, sessionId: newSession.id, expiresAt };
    } catch (error: any) {
        console.error("Generate session error:", error);
        return { error: error.message || "Failed to generate session" };
    }
}

// Check-in via QR token
export async function qrCheckIn(rawToken: string) {
    try {
        const userSession = await getSession();
        if (!userSession || !userSession.id) {
            return { error: "You must be logged in to check in." };
        }

        const member = await prisma.member.findUnique({ where: { userId: userSession.id } });
        if (!member) {
            return { error: "You do not have a linked member profile." };
        }

        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

        const attendanceSession = await prisma.attendanceSession.findUnique({
            where: { tokenHash },
            include: { event: true }
        });

        if (!attendanceSession) return { error: "Invalid attendance token." };
        if (!attendanceSession.active) return { error: "This attendance session has been deactivated." };
        if (new Date() > attendanceSession.expiresAt) return { error: "This attendance token has expired." };
        if (attendanceSession.event.isAttendanceLocked) return { error: "Attendance for this event is locked." };

        // Verify if already checked in
        const existing = await prisma.attendance.findUnique({
            where: {
                eventId_memberId: {
                    eventId: attendanceSession.eventId,
                    memberId: member.id
                }
            }
        });

        if (existing) {
            return { error: "You have already checked in for this event." };
        }

        // Record check-in
        await prisma.attendance.create({
            data: {
                eventId: attendanceSession.eventId,
                memberId: member.id,
                status: "PRESENT",
                method: "QR_CODE",
            }
        });

        return { success: true, event: attendanceSession.event };
    } catch (error: any) {
        console.error("QR check-in error:", error);
        return { error: error.message || "Failed to process check-in." };
    }
}

// Check-in via 6-digit PIN (Self Check-in)
export async function memberPinCheckIn(eventId: string, pin: string) {
    try {
        const userSession = await getSession();
        if (!userSession || !userSession.id) {
            return { error: "You must be logged in to check in." };
        }

        const member = await prisma.member.findUnique({ where: { userId: userSession.id } });
        if (!member) {
            return { error: "You do not have a linked member profile." };
        }

        // Verify if already checked in
        const existing = await prisma.attendance.findUnique({
            where: {
                eventId_memberId: {
                    eventId,
                    memberId: member.id
                }
            }
        });

        if (existing) {
            return { error: "You have already checked in for this event." };
        }

        const pinHash = crypto.createHash("sha256").update(pin.trim()).digest("hex");

        // Find active session for this event with matching pin
        const attendanceSession = await prisma.attendanceSession.findFirst({
            where: { 
                eventId,
                active: true,
                expiresAt: { gt: new Date() },
                checkInCodeHash: pinHash
            },
            include: { event: true }
        });

        if (!attendanceSession) return { error: "Invalid or expired check-in PIN." };
        if (attendanceSession.event.isAttendanceLocked) return { error: "Attendance for this event is locked." };

        // Verify registration
        const registration = await prisma.registration.findUnique({
            where: {
                eventId_memberId: {
                    eventId,
                    memberId: member.id
                }
            }
        });

        if (!registration) {
             return { error: "You must be registered for the event before checking in." };
        }

        // Record check-in
        await prisma.attendance.create({
            data: {
                eventId,
                memberId: member.id,
                status: "PRESENT",
                method: "QR_CODE", // or "PIN" but we don't have PIN in the enum, so QR_CODE or MANUAL
            }
        });

        revalidatePath(`/dashboard/events`);
        return { success: true };
    } catch (error: any) {
        console.error("PIN check-in error:", error);
        return { error: error.message || "Failed to process check-in." };
    }
}

// Invalidate Session early
export async function invalidateAttendanceSession(sessionId: string, eventId: string) {
    try {
        const session = await getSession();
        if (!session || !canManageClub(session)) return { error: "Unauthorized" };

        const isAuthorized = session.roles?.some((r: string) => 
            ["SUPER_ADMIN", "CLUB_ADMIN", "EVENTS_ADMIN"].includes(r)
        );
        if (!isAuthorized) return { error: "Permission denied." };

        await prisma.attendanceSession.update({
            where: { id: sessionId },
            data: { active: false }
        });

        revalidatePath(`/admin/events/${eventId}/attendance`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to invalidate session" };
    }
}
