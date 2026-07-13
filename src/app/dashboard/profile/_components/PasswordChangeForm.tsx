"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import { LazyMotion, domMax, m, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion-tokens";

export default function PasswordChangeForm() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/member/profile/password", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch verification code");
      }

      toast.success("Verification code dispatched to your registered email");
      setStep("verify");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/member/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.trim(),
          newPassword: formData.newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      toast.success("Password updated successfully");
      setFormData({ code: "", newPassword: "", confirmPassword: "" });
      setStep("request");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <KeyRound className="w-5 h-5 text-[#F7A800]" />
        <h2 className="text-xl font-bold text-[#0B132B]">Account Credentials</h2>
      </div>

      <AnimatePresence mode="wait">
        {step === "request" ? (
          <LazyMotion features={domMax} key="request-step">
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springs.default}
              className="space-y-4"
            >
              <div className="p-4 bg-slate-50 rounded-2xl flex items-start gap-3 border border-slate-100">
                <ShieldAlert className="w-5 h-5 text-[#003DA5] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#0b132b]">Secure Password Verification</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    To update your login credentials, we will send a one-time passcode (OTP) to your registered email address to verify ownership.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="w-full rounded-xl bg-[#0B132B] hover:bg-[#F7A800] text-white hover:text-[#0B132B] font-bold py-3 text-sm transition shadow-sm motion-button disabled:opacity-50"
              >
                {loading ? "Requesting OTP..." : "Send Verification OTP"}
              </button>
            </m.div>
          </LazyMotion>
        ) : (
          <LazyMotion features={domMax} key="verify-step">
            <m.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springs.default}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="p-4 bg-emerald-50 rounded-2xl flex items-start gap-3 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-800">OTP Sent</p>
                  <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                    Please check your inbox. Enter the code along with your new password details below.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm motion-input font-mono text-center tracking-widest text-lg font-black"
                    placeholder="000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm motion-input"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm motion-input"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 text-sm transition motion-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-sm transition shadow-sm motion-button disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Update Password"}
                </button>
              </div>
            </m.form>
          </LazyMotion>
        )}
      </AnimatePresence>
    </div>
  );
}
