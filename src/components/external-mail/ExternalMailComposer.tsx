"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { previewExternalMailHtml } from "@/features/external-mail/actions/previewExternalMail";
import { deriveNameFromEmail } from "@/lib/derive-name-from-email";
import { MailRecipient } from "@/features/external-mail/schemas/externalMail.schema";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const DELIVERY_MODES: { value: "BCC" | "CC" | "SEPARATE"; label: string; description: string }[] = [
  { value: "BCC", label: "BCC", description: "One email, recipients hidden from each other." },
  { value: "CC", label: "CC", description: "One email, all recipients see each other." },
  { value: "SEPARATE", label: "Separate", description: "Its own personalized email per recipient." },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface Props {
  onSubmit: (data: { recipients: MailRecipient[]; deliveryMode: "BCC" | "CC" | "SEPARATE"; subject: string; body: string }) => Promise<{ error?: string }>;
  onSuccessRedirect: string;
  successMessage: string;
  submitLabel: string;
  initialData?: {
    recipients: MailRecipient[];
    deliveryMode: "BCC" | "CC" | "SEPARATE";
    subject: string;
    body: string;
  };
}

export function ExternalMailComposer({ onSubmit, onSuccessRedirect, successMessage, submitLabel, initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A single email input per recipient row — no separate "add" step to learn.
  // A fresh empty row is always kept at the end so typing into it and moving
  // on is how you add another recipient.
  const [recipients, setRecipients] = useState<MailRecipient[]>(
    initialData ? [...initialData.recipients, { email: "", name: "" }] : [{ email: "", name: "" }]
  );
  const [deliveryMode, setDeliveryMode] = useState<"BCC" | "CC" | "SEPARATE">(initialData?.deliveryMode || "BCC");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const filledRecipients = recipients.filter((r) => r.email.trim());

  const setRecipientEmail = (index: number, email: string) => {
    setRecipients((prev) => {
      const next = [...prev];
      const name = isValidEmail(email) ? (next[index].name || deriveNameFromEmail(email)) : next[index].name;
      next[index] = { ...next[index], email, name };
      // Keep exactly one trailing blank row to type the next recipient into.
      if (index === next.length - 1 && email.trim()) {
        next.push({ email: "", name: "" });
      }
      return next;
    });
  };

  const setRecipientName = (index: number, name: string) => {
    setRecipients((prev) => prev.map((r, i) => (i === index ? { ...r, name } : r)));
  };

  const removeRecipient = (index: number) => {
    setRecipients((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ email: "", name: "" }];
    });
  };

  const canSubmit = filledRecipients.every((r) => isValidEmail(r.email)) && filledRecipients.length > 0 && subject.trim() && body.trim().length >= 10;

  const previewGreeting = useMemo(() => {
    if (filledRecipients.length === 0) return "Sir/Madam";
    if (filledRecipients.length === 1) return filledRecipients[0].name || "Sir/Madam";
    return deliveryMode === "SEPARATE" ? filledRecipients[0].name || "Sir/Madam" : "Sir/Madam";
  }, [filledRecipients, deliveryMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      previewExternalMailHtml(previewGreeting, body).then((res) => {
        if (res.html) setPreviewHtml(res.html);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [previewGreeting, body]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await onSubmit({ recipients: filledRecipients, deliveryMode, subject, body });
      if (res.error) {
        setError(res.error);
        return;
      }
      toast.success(successMessage);
      router.push(onSuccessRedirect);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm">{error}</div>}

      {/* Recipients Section */}
      <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">Recipients</h3>

        <div className="space-y-3">
          {recipients.map((r, i) => {
            const isLast = i === recipients.length - 1;
            const isEmpty = !r.email.trim();
            return (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="email"
                  value={r.email}
                  onChange={(e) => setRecipientEmail(i, e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
                  placeholder={isLast && isEmpty ? "recipient@example.com" : "another@example.com"}
                />
                {!isEmpty && (
                  <input
                    type="text"
                    value={r.name}
                    onChange={(e) => setRecipientName(i, e.target.value)}
                    className="w-44 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm text-slate-600"
                    placeholder="Greeting name"
                  />
                )}
                {!isEmpty && (
                  <button type="button" onClick={() => removeRecipient(i)} className="p-2 text-slate-400 hover:text-red-500 shrink-0" aria-label="Remove recipient">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Start typing another email above to add more recipients.
        </p>

        {filledRecipients.length > 1 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="text-sm font-medium text-slate-700">How should this go out to {filledRecipients.length} recipients?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DELIVERY_MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setDeliveryMode(m.value)}
                  className={cn(
                    "text-left p-3 rounded-lg border transition-colors",
                    deliveryMode === m.value ? "border-brand bg-brand/5" : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">Email Content</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
            placeholder="e.g., Sponsorship Proposal for Annual Event"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the email content here..."
              rows={12}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm font-medium min-h-[300px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Live Email Preview</label>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white h-[360px] relative">
              {previewHtml ? (
                <iframe title="Email Preview" srcDoc={previewHtml} className="w-full h-full border-none" sandbox="allow-same-origin" />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">Start typing to preview the email...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? "Sending..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
