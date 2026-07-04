import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Receipt, ArrowLeft } from "lucide-react";
import SubmitPaymentForm from "../_components/SubmitPaymentForm";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { redirect } from "next/navigation";
import Link from "next/link";

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
      <Link href="/dashboard/finance" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Finance
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-purple-900/5 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 border-b border-purple-100 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
            <Receipt className="h-5 w-5" />
          </div>
          <h1 className="font-bold text-xl text-purple-900">Submit Payment Proof</h1>
        </div>
        <div className="p-6">
          <SubmitPaymentForm upiId={club.upiId} paymentQr={club.paymentQr} clubName={club.name} />
        </div>
      </div>
    </div>
  );
}
