"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, Calendar, CreditCard, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Zod Validation Schema matching guidelines:
// Title min 3 chars, amount > 0, category and account required
const transactionFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().nullable(),
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  sourceType: z.enum(["GENERAL", "PROJECT", "EVENT"]),
  projectId: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]),
  referenceNumber: z.string().optional().nullable(),
  receiptUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.string().length(0)),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "VOIDED"]).optional()
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  accounts: any[];
  categories: any[];
  projects: any[];
  events: any[];
  onSubmitAction: (data: any) => Promise<{ success?: boolean; error?: string }>;
  initialData?: any;
  onCancel?: () => void;
}

export default function TransactionForm({
  accounts,
  categories,
  projects,
  events,
  onSubmitAction,
  initialData,
  onCancel
}: TransactionFormProps) {
  const [loading, setLoading] = useState(false);

  // Filter accounts to CASH and BANK only
  const validAccounts = accounts.filter(a => ["CASH", "BANK"].includes(a.type));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      amount: initialData?.amount ? Number(initialData.amount) : undefined,
      type: initialData?.type || "EXPENSE",
      categoryId: initialData?.categoryId || "",
      accountId: initialData?.accountId || "",
      sourceType: initialData?.projectId ? "PROJECT" : initialData?.eventId ? "EVENT" : "GENERAL",
      projectId: initialData?.projectId || "",
      eventId: initialData?.eventId || "",
      paymentMethod: initialData?.paymentMethod || "CASH",
      referenceNumber: initialData?.referenceNumber || "",
      receiptUrl: initialData?.receiptUrl || "",
      date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      status: initialData?.status || "PENDING_APPROVAL"
    }
  });

  const sourceType = watch("sourceType");

  async function handleFormSubmit(values: TransactionFormValues) {
    setLoading(true);
    const toastId = toast.loading("Saving transaction entry...");
    try {
      const payload = {
        ...values,
        projectId: values.sourceType === "PROJECT" ? values.projectId : null,
        eventId: values.sourceType === "EVENT" ? values.eventId : null
      };

      const res = await onSubmitAction(payload);
      if (res.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success("Transaction entry saved successfully!", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save transaction entry", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Transaction Type</label>
          <select
            {...register("type")}
            className="w-full border border-gray-300 p-2.5 rounded-xl text-sm bg-white"
          >
            <option value="EXPENSE">Expense (Money Out)</option>
            <option value="INCOME">Income (Money In)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Amount (₹) *</label>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm"
            />
          </div>
          {errors.amount && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.amount.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Title / Subject *</label>
        <Input
          type="text"
          placeholder="e.g. Printer cartridges purchase"
          {...register("title")}
          className="rounded-xl"
        />
        {errors.title && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category *</label>
          <select
            {...register("categoryId")}
            className="w-full border border-gray-300 p-2.5 rounded-xl text-sm bg-white"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.categoryId.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Account *</label>
          <select
            {...register("accountId")}
            className="w-full border border-gray-300 p-2.5 rounded-xl text-sm bg-white"
          >
            <option value="">Select Account</option>
            {validAccounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
            ))}
          </select>
          {errors.accountId && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.accountId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Method *</label>
          <select
            {...register("paymentMethod")}
            className="w-full border border-gray-300 p-2.5 rounded-xl text-sm bg-white"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date</label>
          <input
            type="date"
            {...register("date")}
            className="w-full border border-gray-300 p-2 rounded-xl text-sm"
          />
          {errors.date && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Source Type</label>
          <select
            {...register("sourceType")}
            className="w-full border border-gray-300 p-2.5 rounded-xl text-sm bg-white"
          >
            <option value="GENERAL">General Club</option>
            <option value="PROJECT">Project Related</option>
            <option value="EVENT">Event Related</option>
          </select>
        </div>

        {sourceType === "PROJECT" && (
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Linked Project</label>
            <select
              {...register("projectId")}
              className="w-full border border-gray-300 p-2.5 rounded-xl text-sm bg-white"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}

        {sourceType === "EVENT" && (
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Linked Event</label>
            <select
              {...register("eventId")}
              className="w-full border border-gray-300 p-2.5 rounded-xl text-sm bg-white"
            >
              <option value="">Select Event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Reference / Check ID</label>
          <Input
            type="text"
            placeholder="e.g. TXN-182763"
            {...register("referenceNumber")}
            className="rounded-xl"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Receipt Link / URL</label>
          <Input
            type="text"
            placeholder="e.g. https://cloud.com/receipt.pdf"
            {...register("receiptUrl")}
            className="rounded-xl"
          />
          {errors.receiptUrl && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.receiptUrl.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description / Memo</label>
        <Textarea
          rows={3}
          placeholder="Memo details for auditing..."
          {...register("description")}
          className="rounded-xl"
        />
      </div>

      {initialData && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Initial Status</label>
          <select
            {...register("status")}
            className="w-full border border-gray-300 p-2.5 rounded-xl text-sm bg-white"
          >
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="VOIDED">Voided</option>
          </select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
          {loading ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </form>
  );
}
