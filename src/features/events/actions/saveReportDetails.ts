"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { revalidatePath } from "next/cache";

// Only the report-finishing fields live here. Avenue (event.type), purpose
// (event.description), beneficiaries + objectives (event fields), and chair/
// co-chair/volunteers (event team) are NOT re-entered — they derive from the event.
export interface CouncilMember {
  name: string;
  designation?: string;
}

export interface EventReportDetails {
  // Optional per-report overrides of derived values (blank = use the event's).
  avenue?: string;
  purpose?: string;

  secretary?: string;
  // District/council people present — a repeatable list of (name, designation).
  councilPresence?: CouncilMember[];
  partners?: string;
  photographer?: string;
  designer?: string;
  emcee?: string;
}

/**
 * Saves the chair-filled qualitative fields for the official event report.
 * Authorized for admins and this event's chair/co-chair.
 */
export async function saveReportDetails(eventId: string, details: EventReportDetails) {
  const session = await getSession();
  if (!session || !(await canManageEvent(session, eventId))) return { error: "Unauthorized" };

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { reportDetails: details as any },
    });
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/member/events/${eventId}/manage`);
    revalidatePath(`/reports/events/${eventId}`);
    return { success: true };
  } catch (e: any) {
    console.error("saveReportDetails error:", e);
    return { error: e.message || "Failed to save report details" };
  }
}
