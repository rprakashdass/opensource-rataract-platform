"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { updateComplaintStatus, type ComplaintStatus } from "@/features/complaints/actions/updateComplaintStatus";
import type { AnonComplaintRecord } from "@/features/complaints/queries/getComplaints";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, SlidersHorizontal, MessageSquarePlus, CheckCircle2, Clock, XCircle, Loader2, NotebookPen } from "lucide-react";

const STATUS_OPTIONS: { value: ComplaintStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "COMPLAINT", label: "🚩 Complaint" },
  { value: "FEEDBACK", label: "💬 Feedback" },
  { value: "SUGGESTION", label: "💡 Suggestion" },
  { value: "OTHER", label: "📝 Other" },
];

const STATUS_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  OPEN:      { label: "Open",      className: "bg-amber-50 text-amber-700 border-amber-200",   icon: <Clock className="w-3 h-3" /> },
  REVIEWING: { label: "Reviewing", className: "bg-blue-50 text-blue-700 border-blue-200",     icon: <SlidersHorizontal className="w-3 h-3" /> },
  RESOLVED:  { label: "Resolved",  className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  DISMISSED: { label: "Dismissed", className: "bg-slate-100 text-slate-500 border-slate-200", icon: <XCircle className="w-3 h-3" /> },
};

const CATEGORY_LABEL: Record<string, string> = {
  COMPLAINT: "🚩 Complaint",
  FEEDBACK: "💬 Feedback",
  SUGGESTION: "💡 Suggestion",
  OTHER: "📝 Other",
};

interface ComplaintsTableProps {
  complaints: AnonComplaintRecord[];
  total: number;
  page: number;
  pageSize: number;
  currentStatus?: string;
  currentCategory?: string;
}

function StatusUpdater({ id, currentStatus, currentNote }: { id: string; currentStatus: string; currentNote: string | null }) {
  const [status, setStatus] = useState<ComplaintStatus>(currentStatus as ComplaintStatus);
  const [note, setNote] = useState(currentNote ?? "");
  const [showNote, setShowNote] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleUpdate = (newStatus: ComplaintStatus) => {
    setStatus(newStatus);
    setSaved(false);
    startTransition(async () => {
      await updateComplaintStatus(id, newStatus, note);
      setSaved(true);
    });
  };

  const handleNoteSave = () => {
    startTransition(async () => {
      await updateComplaintStatus(id, status, note);
      setSaved(true);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Status selector */}
      <div className="flex gap-1.5 flex-wrap">
        {(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"] as ComplaintStatus[]).map((s) => {
          const badge = STATUS_BADGE[s];
          return (
            <button
              key={s}
              onClick={() => handleUpdate(s)}
              disabled={isPending}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border font-medium transition-all ${
                status === s
                  ? badge.className + " ring-1 ring-offset-1 ring-current"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {isPending && status === s ? <Loader2 className="w-3 h-3 animate-spin" /> : badge.icon}
              {badge.label}
            </button>
          );
        })}
      </div>

      {/* Admin note toggle */}
      <div>
        <button
          onClick={() => setShowNote(!showNote)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <NotebookPen className="w-3 h-3" />
          {showNote ? "Hide note" : (note ? "Edit note" : "Add admin note")}
        </button>
        {showNote && (
          <div className="mt-2 flex flex-col gap-1.5">
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value); setSaved(false); }}
              placeholder="Internal note (only visible to admins)"
              rows={2}
              className="w-full text-xs text-slate-700 border border-slate-200 rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleNoteSave}
                disabled={isPending}
                className="text-xs px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-md font-medium transition disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save note"}
              </button>
              {saved && <span className="text-xs text-emerald-600 font-medium">✓ Saved</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComplaintsTable({
  complaints,
  total,
  page,
  pageSize,
  currentStatus,
  currentCategory,
}: ComplaintsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500 font-medium">Filter:</span>
        </div>
        <select
          value={currentStatus ?? ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={currentCategory ?? ""}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{total} submission{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Table / Cards */}
      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center">
            <MessageSquarePlus className="w-6 h-6 text-violet-400" />
          </div>
          <p className="font-semibold text-slate-700">No complaints yet</p>
          <p className="text-xs text-slate-400 max-w-[240px]">
            When members use the Speak Up feature, their submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.OPEN;
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 md:flex-row md:gap-6 hover:border-slate-300 transition-colors"
              >
                {/* Left: content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {CATEGORY_LABEL[c.category] ?? c.category}
                    </span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${badge.className}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{c.message}</p>
                  {c.adminNote && (
                    <div className="mt-2 p-2.5 bg-violet-50 border border-violet-100 rounded-lg">
                      <p className="text-xs font-semibold text-violet-600 mb-0.5">Admin Note</p>
                      <p className="text-xs text-violet-800 leading-relaxed">{c.adminNote}</p>
                    </div>
                  )}
                </div>

                {/* Right: status controls */}
                <div className="flex-shrink-0 md:w-56">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Update Status</p>
                  <StatusUpdater id={c.id} currentStatus={c.status} currentNote={c.adminNote} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
