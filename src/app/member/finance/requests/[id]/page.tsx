import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import { Receipt, CheckCircle2, Clock, Download, Lock } from "lucide-react";
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
      transactions: { where: { OR: [{ userId: session.id }, { memberId: member.id }] } },
    },
  });

  if (!request || request.clubId !== member.clubId) notFound();

  const isAssigned = request.isGlobal
    || (await prisma.paymentRequestAssignee.findUnique({
      where: { paymentRequestId_memberId: { paymentRequestId: id, memberId: member.id } },
    })) !== null;
  if (!isAssigned) notFound();

  const paidTransaction = request.transactions.find((t) => t.status === "APPROVED");
  const pendingTransaction = request.transactions.find((t) => t.status === "PENDING_APPROVAL");
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
              {request.closedAt && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                  <Lock className="h-2.5 w-2.5" /> Closed
                </span>
              )}
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
          {!paidTransaction && !pendingTransaction && request.closedAt ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center space-y-2">
              <Lock className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">This payment request is closed</p>
              <p className="text-xs text-slate-600">
                The club closed it on {formatIST(request.closedAt, "MMM d, yyyy")} and is no longer collecting payments for it.
              </p>
              <p className="text-xs text-slate-600">If you still need to pay, reach out to the treasurer.</p>
            </div>
          ) : paidTransaction ? (
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
          ) : pendingTransaction ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
              <Clock className="h-8 w-8 text-amber-600 mx-auto" />
              <p className="text-sm font-semibold text-amber-800">Payment submitted — awaiting approval</p>
              <p className="text-xs text-amber-700">
                ₹{Number(pendingTransaction.amount).toLocaleString("en-IN")} · submitted {formatIST(pendingTransaction.date, "MMM d, yyyy")}
              </p>
              <p className="text-xs text-amber-700">You'll be notified once the treasurer reviews it — no need to submit again.</p>
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
