import { getTransaction } from "@/features/finance/queries/get-transaction";
import { notFound } from "next/navigation";
import TransactionDetailView from "./_components/TransactionDetailView";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const transaction = await getTransaction(params.id);

  if (!transaction) {
    notFound();
  }

  // Ensure Decimal is safely passed to Client Component
  const safeTransaction = {
    ...transaction,
    amount: Number(transaction.amount),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      <TransactionDetailView transaction={safeTransaction} />
    </div>
  );
}
