import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditPaymentRequestForm from "./_components/EditPaymentRequestForm";

export default async function EditPaymentRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const request = await prisma.paymentRequest.findUnique({
    where: { id },
    include: { assignees: { include: { member: { select: { name: true, email: true } } } } },
  });

  if (!request) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Link href="/admin/finance/requests" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Edit Payment Request</h1>
          <p className="text-sm text-gray-500 mt-1">Update the details of this request.</p>
        </div>
      </div>

      <EditPaymentRequestForm
        request={{
          id: request.id,
          title: request.title,
          description: request.description || "",
          amount: Number(request.amount),
          category: request.category,
          isGlobal: request.isGlobal,
          dueDate: request.dueDate ? new Date(request.dueDate).toISOString().slice(0, 10) : "",
        }}
        audience={
          request.isGlobal
            ? "All Members"
            : request.assignees.map(a => a.member.name || a.member.email).join(", ") || "No members assigned"
        }
      />
    </div>
  );
}
