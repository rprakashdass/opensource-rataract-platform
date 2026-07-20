"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCommunication } from "@/features/communications/actions/communicationActions";
import { MailboxPriority, MailboxType } from "@prisma/client";
import { Send, Loader2, ArrowLeft, Paperclip, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { DocumentUpload } from "@/components/ui/document-upload";
import { submitComplaint, ComplaintCategory } from "@/features/complaints/actions/submitComplaint";

const TYPE_OPTIONS: { value: MailboxType; label: string; description: string; emoji: string }[] = [
  { value: "EXCUSE",    label: "Absence Excuse",       description: "Request an excuse for a missed or upcoming event", emoji: "🙏" },
  { value: "COMPLAINT", label: "Complaint / Grievance", description: "Raise a concern or report an issue to the board", emoji: "🚩" },
  { value: "INQUIRY",   label: "General Inquiry",       description: "Ask the board a question or seek guidance",       emoji: "💬" },
  { value: "OTHER",     label: "Speak Up (Anonymous)",  description: "Submit an anonymous report. Your identity is completely hidden.", emoji: "🕵️" },
];

const PRIORITY_OPTIONS: { value: MailboxPriority; label: string; dot: string; activeClass: string }[] = [
  { value: "LOW",    label: "Low",           dot: "bg-slate-400", activeClass: "border-slate-400 bg-slate-50 text-slate-700" },
  { value: "MEDIUM", label: "Medium",        dot: "bg-amber-400", activeClass: "border-amber-400 bg-amber-50 text-amber-800" },
  { value: "HIGH",   label: "High (Urgent)", dot: "bg-rose-500",  activeClass: "border-rose-400 bg-rose-50 text-rose-700"  },
];

export default function NewMailForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType]           = useState<MailboxType>("COMPLAINT");
  const [priority, setPriority]   = useState<MailboxPriority>("MEDIUM");
  const [subject, setSubject]     = useState("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const isAnonymous = type === "OTHER";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) { toast.error("Please enter a subject."); return; }
    if (!description.trim()) { toast.error("Please write your message."); return; }

    startTransition(async () => {
      if (isAnonymous) {
        const message = `Subject: ${subject.trim()}\n\n${description.trim()}`;
        if (message.length < 20) {
          toast.error("Anonymous messages must be at least 20 characters total.");
          return;
        }
        const res = await submitComplaint({
          category: "OTHER",
          message: message.slice(0, 1000),
          attachmentUrl: attachmentUrl || undefined
        });
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Anonymous message submitted!");
          router.push("/dashboard/mailbox");
          router.refresh();
        }
      } else {
        const res = await createCommunication({ 
          subject: subject.trim(), 
          description: description.trim(), 
          priority, 
          type,
          attachmentUrl: attachmentUrl || undefined
        });
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Message sent to the board!");
          router.push("/dashboard/mailbox");
          router.refresh();
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Type picker */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          What's this about? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TYPE_OPTIONS.map((opt) => {
            const active = type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-150 ${
                  active
                    ? "border-brand bg-pink-50/70 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-2xl leading-none mt-0.5">{opt.emoji}</span>
                <div>
                  <p className={`text-sm font-semibold leading-snug ${active ? "text-brand" : "text-slate-800"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label htmlFor="subject" className="block text-sm font-semibold text-slate-700">
          Subject <span className="text-rose-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          placeholder="e.g. Excuse for General Meeting on July 25"
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
        />
        <p className="text-xs text-slate-400 text-right tabular-nums">{subject.length}/120</p>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
          Message <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Provide as much context as possible so the board can respond effectively..."
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition leading-relaxed"
        />
      </div>

      {/* Attachment */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          Attachment <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        {isAnonymous && (
          <p className="text-xs text-amber-600 font-medium mb-1.5">
            ⚠️ Warning: Files may contain identifying metadata (like author name or location). Be sure to scrub metadata before uploading if you want to remain 100% anonymous.
          </p>
        )}
        <DocumentUpload
          value={attachmentUrl}
          onChange={setAttachmentUrl}
          type="REPORT"
          label="File"
        />
      </div>

      {!isAnonymous && (
        <>
          {/* Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Priority</label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((opt) => {
                const active = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                      active ? opt.activeClass : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${active ? opt.dot : "bg-slate-300"}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link
          href="/dashboard/mailbox"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mailbox
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
          ) : (
            <><Send className="w-4 h-4" />Send Message</>
          )}
        </button>
      </div>
    </form>
  );
}
