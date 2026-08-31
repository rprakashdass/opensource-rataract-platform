import QRCode from "qrcode";

export function buildUpiUri({
  upiId,
  payeeName,
  amount,
  note,
}: {
  upiId: string;
  payeeName: string;
  amount?: number | string;
  note?: string;
}): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    cu: "INR",
  });
  if (amount !== undefined && amount !== null && amount !== "") {
    params.set("am", String(amount));
  }
  if (note) {
    params.set("tn", note);
  }
  return `upi://pay?${params.toString()}`;
}

export async function generateUpiQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}
