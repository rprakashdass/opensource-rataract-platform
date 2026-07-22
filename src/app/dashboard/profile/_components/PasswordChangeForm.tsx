"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { LazyMotion, domMax, m, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion-tokens";

/**
 * Compact password change. Collapsed to a single "Password ••••••  Change" row;
 * clicking Change emails a one-time code and reveals the code + new-password
 * fields inline — no permanent nested card.
 */
export default function PasswordChangeForm({ email }: { email?: string | null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const reset = () => {
    setOpen(false);
    setSent(false);
    setFormData({ code: "", newPassword: "", confirmPassword: "" });
  };

  const sendCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/member/profile/password", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setSent(true);
      toast.success("We emailed you a 6-digit code.");
    } catch (err: any) {
      toast.error(err.message);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setOpen(true);
    if (!sent) sendCode();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return toast.error("Enter the 6-digit code");
    if (formData.newPassword.length < 6)
      return toast.error("New password must be at least 6 characters");
    if (formData.newPassword !== formData.confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("/api/member/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.code.trim(), newPassword: formData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      toast.success("Password updated.");
      reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm text-ink motion-input focus:border-brand focus:outline-none";

  return (
    <LazyMotion features={domMax}>
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-wash flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Password</p>
              <p className="text-xs text-ink-faint font-medium tracking-[0.2em]">••••••••</p>
            </div>
          </div>
          {!open && (
            <button
              type="button"
              onClick={handleStart}
              className="motion-button rounded-xl border border-hairline px-4 py-2 text-xs font-bold text-ink-soft hover:border-brand hover:text-brand transition-colors"
            >
              Change
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <m.form
              key="pw-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springs.default}
              onSubmit={handleSubmit}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-hairline space-y-3">
                <p className="text-xs text-ink-soft font-medium leading-relaxed">
                  {loading && !sent ? (
                    "Sending a code to your email…"
                  ) : (
                    <>
                      Enter the 6-digit code we emailed
                      {email ? (
                        <>
                          {" "}
                          to <span className="font-semibold text-ink">{email}</span>
                        </>
                      ) : null}
                      , then set a new password.
                    </>
                  )}
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                  className={`${inputCls} font-mono text-center tracking-[0.4em] text-lg font-bold`}
                  placeholder="000000"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData((p) => ({ ...p, newPassword: e.target.value }))}
                  className={inputCls}
                  placeholder="New password (min 6 characters)"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className={inputCls}
                  placeholder="Confirm new password"
                />

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={reset}
                    className="motion-button flex-1 rounded-xl border border-hairline py-2.5 text-sm font-bold text-ink-soft hover:bg-wash transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !sent}
                    className="motion-button flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-deep transition-colors disabled:opacity-50"
                  >
                    {loading && sent && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update password
                  </button>
                </div>

                {sent && (
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={loading}
                    className="text-xs font-semibold text-ink-faint hover:text-brand transition-colors disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </m.form>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
