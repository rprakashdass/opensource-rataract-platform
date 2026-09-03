import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import { Receipt, CheckCircle2, Clock, Download } from "lucide-react";
import SubmitPaymentForm from "../../_components/SubmitPaymentForm";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { formatIST } from "@/lib/date-utils";

export default async function PaymentRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const member = await prisma.member.findUnique({ where: { userId: session.id } });
  if (!member) redirect("/member/finance");

  const request = await prisma.paymentRequest.findUnique({
    where: { id },
    include: {
      transactions: { where: { userId: session.id } },
    },
  });

  if (!request || request.clubId !== member.clubId) notFound();

  const isAssigned = request.isGlobal
    || (await prisma.paymentRequestAssignee.findUnique({
      where: { paymentRequestId_memberId: { paymentRequestId: id, memberId: member.id } },
    })) !== null;
  if (!isAssigned) notFound();

  const paidTransaction = request.transactions.find((t) => t.status === "APPROVED");
  const club = await getOrCreateDefaultClub();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={request.title}
        backHref="/member/finance"
        backLabel="Back to Finance"
      />

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-lg text-brand">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">₹{Number(request.amount).toLocaleString("en-IN")}</h2>
              {request.dueDate && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" /> Due {formatIST(request.dueDate, "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
        </div>

        {request.description && (
          <div className="px-6 pt-5 text-sm text-slate-600 leading-relaxed">{request.description}</div>
        )}

        <div className="p-6">
          {paidTransaction ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-emerald-800">You've already paid this request</p>
              <p className="text-xs text-emerald-700">
                ₹{Number(paidTransaction.amount).toLocaleString("en-IN")} · {formatIST(paidTransaction.date, "MMM d, yyyy")}
              </p>
              {paidTransaction.receiptDocUrl && (
                <a
                  href={paidTransaction.receiptDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download receipt{paidTransaction.receiptNumber ? ` · ${paidTransaction.receiptNumber}` : ""}
                </a>
              )}
            </div>
          ) : (
            <SubmitPaymentForm
              upiId={club.upiId}
              paymentQr={club.paymentQr}
              clubName={club.name}
              paymentRequestId={request.id}
              initialAmount={String(Number(request.amount))}
              initialDescription={request.title}
              initialCategory={request.category}
            />
          )}
        </div>
      </div>
    </div>
  );
}
