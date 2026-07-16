"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, FileType, QrCode, Smartphone, Info } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import { FileUpload } from "@/components/ui/file-upload";

export default function SubmitPaymentForm({ upiId, paymentQr, clubName }: { upiId: string | null, paymentQr: string | null, clubName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState(searchParams.get("amount") || "");
  const [description, setDescription] = useState(searchParams.get("desc") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "DUES");
  const [receiptUrl, setReceiptUrl] = useState("");
  const paymentRequestId = searchParams.get("requestId");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptUrl) {
      toast.error("Please upload a receipt image before submitting.");
      return;
    }
    const loadingToast = toast.loading("Submitting payment proof...");
    setSubmitting(true);

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description, category, receiptUrl, paymentRequestId }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Payment proof submitted for approval", { id: loadingToast });
      setAmount("");
      setDescription("");
      setCategory("DUES");
      setReceiptUrl("");
      if (paymentRequestId) {
        router.push("/dashboard/finance");
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-700 mt-0.5 shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 text-sm mb-1">How to pay?</h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              Scan the QR code below or tap it on your mobile device to open your UPI app (GPay, PhonePe, Paytm). Complete the payment and upload the screenshot below.
            </p>
          </div>
        </div>

        {(upiId || paymentQr) ? (
          <div className="bg-white rounded-lg p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
            {paymentQr ? (
              <a 
                href={upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(clubName)}` : '#'} 
                className="group relative block transition-transform hover:scale-105 active:scale-95"
                title="Tap to pay with UPI app"
              >
                <div className="w-32 h-32 relative border-4 border-white shadow-sm rounded-lg overflow-hidden bg-slate-50">
                  <Image src={paymentQr} alt="Club Payment QR" fill sizes="128px" className="object-contain" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg group-hover:bg-emerald-600 transition-colors">
                  <Smartphone className="h-4 w-4" />
                </div>
              </a>
            ) : upiId ? (
              <a 
                href={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(clubName)}`} 
                className="group relative block transition-transform hover:scale-105 active:scale-95"
                title="Tap to pay with UPI app"
              >
                <div className="w-32 h-32 relative border-4 border-white shadow-sm rounded-lg overflow-hidden bg-white p-1 flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(clubName)}`)}`}
                    alt="Club Payment QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg group-hover:bg-emerald-600 transition-colors">
                  <Smartphone className="h-4 w-4" />
                </div>
              </a>
            ) : null}
            
            {upiId && (
              <div className="mt-4 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Official UPI ID</span>
                <div className="text-sm font-mono font-bold bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 text-slate-900 select-all">
                  {upiId}
                </div>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-3 max-w-[200px]">
              Tap the QR code on mobile devices to pay directly via installed UPI apps.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-xs font-medium text-left leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">No payment credentials set:</span> The club has not configured its UPI ID or payment QR code yet. Please contact your club treasurer to set up payment details in the admin settings portal.
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid (₹) *</label>
        <input required type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-brand focus:border-brand" placeholder="e.g. 500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:ring-brand focus:border-brand">
          {Object.entries(TRANSACTION_CATEGORIES).map(([key, val]) => (
            <option key={key} value={key}>{val}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
        <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-brand focus:border-brand" placeholder="e.g. Dues for Q3 2026" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Receipt / Proof (PDF or Image)</label>
        <FileUpload
          value={receiptUrl}
          onChange={setReceiptUrl}
          accept="image/*,application/pdf"
        />
      </div>

        <button type="submit" disabled={submitting} className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep transition disabled:opacity-50 mt-4">
          {submitting ? "Submitting..." : "Submit Proof"}
        </button>
      </form>
    </div>
  );
}
