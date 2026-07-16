"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentsField } from "@/components/initiatives/AttachmentsField";
import { createInitiative } from "@/features/initiatives/actions/createInitiative";
import { updateInitiative } from "@/features/initiatives/actions/updateInitiative";
import { deleteInitiative } from "@/features/initiatives/actions/deleteInitiative";
import { ROUTES } from "@/lib/constants";
import { Save, Send, Trash2 } from "lucide-react";

interface Portfolio {
  id: string;
  name: string;
}

interface Props {
  initiative?: any;
  portfolios: Portfolio[];
}

const inputClass = "w-full border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none";

export default function InitiativeForm({ initiative, portfolios }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"draft" | "submit" | "delete" | null>(null);
  const [form, setForm] = useState({
    title: initiative?.title || "",
    description: initiative?.description || "",
    portfolioId: initiative?.portfolioId || "",
    problemStatement: initiative?.problemStatement || "",
    expectedImpact: initiative?.expectedImpact || "",
    estimatedBudget: initiative?.estimatedBudget?.toString() || "",
    preferredDate: initiative?.preferredDate ? new Date(initiative.preferredDate).toISOString().slice(0, 10) : "",
    attachments: (initiative?.attachments as string[]) || [],
  });

  const save = async (submit: boolean) => {
    setLoading(submit ? "submit" : "draft");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        portfolioId: form.portfolioId || null,
        problemStatement: form.problemStatement || null,
        expectedImpact: form.expectedImpact || null,
        estimatedBudget: form.estimatedBudget ? parseFloat(form.estimatedBudget) : null,
        preferredDate: form.preferredDate || null,
        attachments: form.attachments.filter(Boolean),
      };

      const res = initiative
        ? await updateInitiative(initiative.id, payload, submit)
        : await createInitiative(payload, submit);

      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(submit ? "Idea submitted for review!" : "Draft saved!");
      const savedId = (res as any).initiative?.id || initiative?.id;
      router.push(`${ROUTES.DASHBOARD}/initiatives/${savedId}`);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!initiative || !confirm("Delete this draft idea?")) return;
    setLoading("delete");
    const res = await deleteInitiative(initiative.id);
    setLoading(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Draft deleted");
    router.push(`${ROUTES.DASHBOARD}/initiatives`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title *</label>
        <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Weekend Blood Donation Drive" />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description *</label>
        <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this initiative about?" />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portfolio</label>
        <select className={inputClass} value={form.portfolioId} onChange={(e) => setForm({ ...form, portfolioId: e.target.value })}>
          <option value="">Select portfolio (optional)</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Problem Statement</label>
        <Textarea rows={3} value={form.problemStatement} onChange={(e) => setForm({ ...form, problemStatement: e.target.value })} placeholder="What problem does this solve?" />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Impact</label>
        <Textarea rows={3} value={form.expectedImpact} onChange={(e) => setForm({ ...form, expectedImpact: e.target.value })} placeholder="Who benefits and how?" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estimated Budget (₹)</label>
          <input type="number" min="0" className={inputClass} value={form.estimatedBudget} onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })} placeholder="e.g. 5000" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Date</label>
          <input type="date" className={inputClass} value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Attachments</label>
        <AttachmentsField value={form.attachments} onChange={(attachments) => setForm({ ...form, attachments })} />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-100">
        <div>
          {initiative?.status === "DRAFT" && (
            <Button type="button" variant="outline" onClick={handleDelete} disabled={loading !== null} className="text-red-600 hover:bg-red-50 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Draft
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => save(false)} disabled={loading !== null || !form.title || !form.description} className="rounded-xl">
            <Save className="w-4 h-4 mr-2" /> {loading === "draft" ? "Saving..." : "Save Draft"}
          </Button>
          <Button type="button" onClick={() => save(true)} disabled={loading !== null || !form.title || !form.description} className="rounded-xl bg-brand hover:bg-brand-deep text-white">
            <Send className="w-4 h-4 mr-2" /> {loading === "submit" ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
