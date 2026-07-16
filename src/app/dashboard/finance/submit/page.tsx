import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Receipt } from "lucide-react";
import SubmitPaymentForm from "../_components/SubmitPaymentForm";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/portal";

export default async function SubmitPaymentPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.id }
  });

  const club = await getOrCreateDefaultClub();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Submit Payment Proof"
        backHref="/dashboard/finance"
        backLabel="Back to Finance"
      />

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-pink-50 rounded-lg text-brand">
            <Receipt className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Payment Details</h2>
        </div>
        <div className="p-6">
          <SubmitPaymentForm upiId={club.upiId} paymentQr={club.paymentQr} clubName={club.name} />
        </div>
      </div>
    </div>
  );
}
