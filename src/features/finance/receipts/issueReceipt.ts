import { prisma } from "@/lib/prisma";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { renderReceiptPdf, type ReceiptData } from "./renderReceiptPdf";
import { sendEmail } from "@/lib/email";
import { getTransactionReceiptEmailHtml } from "@/lib/email-templates";

export interface IssuedReceipt {
  receiptNumber: string;
  url: string | null;
  buffer: Buffer;
  payerName: string;
  payerEmail: string | null;
}

// Fetch the club logo as PDF-embeddable bytes. react-pdf only decodes PNG/JPEG,
// so we skip anything else (e.g. WebP) rather than crash the render.
async function loadLogo(logoUrl?: string | null): Promise<ReceiptData["logo"]> {
  if (!logoUrl) return null;
  try {
    const res = await fetch(getGoogleDriveDirectLink(logoUrl));
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    const format = type.includes("png") ? "png" : type.includes("jpeg") || type.includes("jpg") ? "jpg" : null;
    if (!format) return null;
    return { data: Buffer.from(await res.arrayBuffer()), format };
  } catch {
    return null;
  }
}

/**
 * Generates the official receipt PDF for a transaction, stores it in Supabase
 * Storage, and records the number + link on the transaction. Idempotent: if a
 * receipt was already issued, it is returned as-is.
 */
// Emails the receipt (PDF attached) to the payer. No-op if we have no address.
async function emailReceipt(tx: any, r: IssuedReceipt): Promise<void> {
  if (!r.payerEmail) return;
  const emailTx = {
    id: tx.id,
    amount: tx.amount,
    status: tx.status,
    description: tx.description,
    category: tx.category?.name,
    date: tx.date,
    user: { name: r.payerName },
  };
  await sendEmail({
    to: r.payerEmail,
    subject: "Payment Approved — Official Receipt Attached",
    text: `Hi ${r.payerName},\n\nYour payment of Rs. ${Number(tx.amount)} has been approved. Your official receipt (${r.receiptNumber}) is attached${r.url ? ` and saved here: ${r.url}` : ""}.`,
    html: getTransactionReceiptEmailHtml(emailTx, tx.club),
    attachments: [
      {
        filename: `Receipt-${r.receiptNumber.replace(/[\/\\]/g, "-")}.pdf`,
        content: r.buffer,
        contentType: "application/pdf",
      },
    ],
  });
}

export async function issueReceipt(
  transactionId: string,
  opts?: { approverName?: string; force?: boolean; email?: boolean; preview?: boolean }
): Promise<IssuedReceipt> {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      club: {
        include: { websiteSettings: { select: { treasSignature: true } } },
      },
      member: { select: { name: true, email: true } },
      user: { select: { name: true, email: true } },
      contributor: { select: { name: true, contact: true } },
      category: { select: { name: true } },
      financialYear: { select: { id: true, name: true } },
    },
  });
  if (!tx) throw new Error("Transaction not found");
  if (!tx.club) throw new Error("Club not found for transaction");

  const payerName = tx.member?.name || tx.user?.name || tx.contributor?.name || "—";
  const contributorEmail = tx.contributor?.contact?.includes("@") ? tx.contributor.contact : null;
  const payerEmail = tx.member?.email || tx.user?.email || contributorEmail || null;
  const amount = Number(tx.amount);
  const fyLabel = tx.financialYear?.name || `RY ${new Date(tx.date).getFullYear()}`;

  // Preview: render the PDF only — no number allocation persisted, no Drive
  // upload, no DB write, no email. Uses the real number if already issued,
  // otherwise a provisional one for display.
  if (opts?.preview) {
    const receiptNumber = tx.receiptNumber || (await nextReceiptNumber(tx.clubId, fyLabel));
    const data = await buildData(tx, payerName, amount, receiptNumber, opts?.approverName);
    return { receiptNumber, url: tx.receiptDocUrl ?? null, buffer: await renderReceiptPdf(data), payerName, payerEmail };
  }

  // Already issued → return existing (unless forced to regenerate).
  if (tx.receiptNumber && tx.receiptDocUrl && !opts?.force) {
    const data = await buildData(tx, payerName, amount, tx.receiptNumber, opts?.approverName);
    const buffer = await renderReceiptPdf(data);
    const issued: IssuedReceipt = { receiptNumber: tx.receiptNumber, url: tx.receiptDocUrl, buffer, payerName, payerEmail };
    if (opts?.email) await emailReceipt(tx, issued).catch((e) => console.error("[issueReceipt] email failed:", e));
    return issued;
  }

  // Allocate a receipt number (retry once on the unique constraint).
  let receiptNumber = tx.receiptNumber || (await nextReceiptNumber(tx.clubId, fyLabel));

  const data = await buildData(tx, payerName, amount, receiptNumber, opts?.approverName);
  const buffer = await renderReceiptPdf(data);

  let url: string | null = null;
  const fileName = `${receiptNumber.replace(/[\/\\]/g, "-")}.pdf`;

  try {
    const supabase = getSupabaseAdmin();
    const path = `${tx.clubId}/finance/receipts/${fileName}`;
    const { error } = await supabase.storage.from("rotaract-media").upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (!error) {
      url = supabase.storage.from("rotaract-media").getPublicUrl(path).data.publicUrl;
    }
  } catch (err) {
    console.error("[issueReceipt] Supabase upload failed:", err);
  }

  try {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { receiptNumber, receiptDocUrl: url, receiptIssuedAt: new Date() },
    });
  } catch (err: any) {
    // Unique collision on receiptNumber — allocate the next one and retry once.
    if (err?.code === "P2002") {
      receiptNumber = await nextReceiptNumber(tx.clubId, fyLabel);
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { receiptNumber, receiptDocUrl: url, receiptIssuedAt: new Date() },
      });
    } else {
      throw err;
    }
  }

  const issued: IssuedReceipt = { receiptNumber, url, buffer, payerName, payerEmail };
  if (opts?.email) await emailReceipt(tx, issued).catch((e) => console.error("[issueReceipt] email failed:", e));
  return issued;
}

async function nextReceiptNumber(clubId: string, fyLabel: string): Promise<string> {
  const count = await prisma.transaction.count({ where: { clubId, receiptNumber: { not: null } } });
  return `RCPT/${fyLabel}/${String(count + 1).padStart(4, "0")}`;
}

async function buildData(
  tx: any,
  payerName: string,
  amount: number,
  receiptNumber: string,
  approverName?: string
): Promise<ReceiptData> {
  const contact = [tx.club.email, tx.club.phone].filter(Boolean).join(" · ") || null;
  const [logo, treasSignature] = await Promise.all([
    loadLogo(tx.club.logoUrl),
    loadLogo(tx.club.websiteSettings?.treasSignature),
  ]);
  return {
    receiptNumber,
    date: tx.approvedAt || tx.date || new Date(),
    clubName: tx.club.name,
    clubAddress: tx.club.address || null,
    clubContact: contact,
    logo,
    payerName,
    amount,
    paymentMethod: tx.paymentMethod || null,
    referenceNumber: tx.referenceNumber || null,
    purpose: tx.description || tx.category?.name || tx.title || "Contribution",
    approvedBy: approverName || null,
    treasSignature,
  };
}
