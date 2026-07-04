"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, FileType, QrCode, Smartphone, Info } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

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
      <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 p-2 rounded-full text-purple-700 mt-0.5 shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 text-sm mb-1">How to pay?</h3>
            <p className="text-xs text-purple-800 leading-relaxed">
              Scan the QR code below or tap it on your mobile device to open your UPI app (GPay, PhonePe, Paytm). Complete the payment and upload the screenshot below.
            </p>
          </div>
        </div>

        {(upiId || paymentQr) && (
          <div className="bg-white rounded-lg p-4 border border-purple-100 flex flex-col items-center justify-center text-center">
            {paymentQr ? (
              <a 
                href={upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(clubName)}` : '#'} 
                className="group relative block transition-transform hover:scale-105 active:scale-95"
                title="Tap to pay with UPI app"
              >
                <div className="w-32 h-32 relative border-4 border-white shadow-sm rounded-lg overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={paymentQr} alt="Club Payment QR" className="object-contain w-full h-full" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg group-hover:bg-emerald-600 transition-colors">
                  <Smartphone className="h-4 w-4" />
                </div>
              </a>
            ) : (
              <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 mb-3">
                <QrCode className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-[10px] uppercase font-bold tracking-wider">No QR Set</span>
              </div>
            )}
            
            {upiId && (
              <div className="mt-4 flex flex-col items-center">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Official UPI ID</span>
                <div className="text-sm font-mono font-bold bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 text-gray-900 select-all">
                  {upiId}
                </div>
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-3 max-w-[200px]">
              Tap the QR code on mobile devices to pay directly via installed UPI apps.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹) *</label>
        <input required type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500" placeholder="e.g. 500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500">
          <option value="DUES">Membership Dues</option>
          <option value="EVENT_FEE">Event Registration Fee</option>
          <option value="DONATION">General Donation</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500" placeholder="e.g. Dues for Q3 2026" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Image</label>
        <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setReceiptUrl(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
          {receiptUrl ? (
            <div className="flex flex-col items-center text-emerald-600">
              <FileType className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Image attached</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <Upload className="h-8 w-8 mb-2 text-purple-400" />
              <span className="text-sm font-medium">Click to upload receipt screenshot</span>
              <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
            </div>
          )}
        </div>
      </div>

        <button type="submit" disabled={submitting} className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition disabled:opacity-50 mt-4">
          {submitting ? "Submitting..." : "Submit Proof"}
        </button>
      </form>
    </div>
  );
}
