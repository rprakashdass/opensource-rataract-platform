import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { buildUpiUri, generateUpiQrDataUrl } from "@/lib/upi-qr";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const club = await getOrCreateDefaultClub();
    if (!club.upiId) return NextResponse.json({ error: "Club UPI ID is not configured" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const amountParam = searchParams.get("amount");
    const amount = amountParam ? parseFloat(amountParam) : undefined;
    const note = searchParams.get("note") || undefined;

    const uri = buildUpiUri({
      upiId: club.upiId,
      payeeName: club.name,
      amount: amount && amount > 0 ? amount : undefined,
      note,
    });
    const qrDataUrl = await generateUpiQrDataUrl(uri);

    return NextResponse.json({ qrDataUrl, upiUri: uri });
  } catch (error: any) {
    return handleApiError(error, "Failed to generate payment QR");
  }
}
