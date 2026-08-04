import { getSession, canManageFinance } from "@/lib/auth/session";
import { issueReceipt } from "@/features/finance/receipts/issueReceipt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Renders the receipt PDF inline for review — no number persisted, no Drive
// upload, no email. Lets the treasurer preview before approving/sending.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !canManageFinance(session)) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    const { buffer, receiptNumber } = await issueReceipt(id, { preview: true });
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="preview-${receiptNumber.replace(/[\/\\]/g, "-")}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[receipt preview] error:", err);
    return new Response(`Failed to render receipt preview: ${err?.message || "unknown error"}`, { status: 500 });
  }
}
