import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error, "Failed to sign out");
  }
}
