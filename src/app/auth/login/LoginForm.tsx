'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (requiresOtp) {
        // Step 2: Validate OTP
        const res = await fetch("/api/auth/login/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: otpEmail, code: otpCode }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "OTP verification failed");
        }

        const redirectPath = searchParams.get('redirect');
        window.location.href = redirectPath || ROUTES.DASHBOARD;
      } else {
        // Step 1: Validate credentials
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loginId, password }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Authentication failed");
        }

        if (data.requiresOtp) {
          setRequiresOtp(true);
          setOtpEmail(data.email);
          toast.success("Security verification code dispatched to your email.");
        } else {
          const redirectPath = searchParams.get('redirect');
          window.location.href = redirectPath || ROUTES.DASHBOARD;
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRequiresOtp(false);
    setOtpCode("");
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
        {requiresOtp ? "Security Verification" : "Welcome Back"}
      </h2>

      {requiresOtp && (
        <p className="text-xs text-slate-600 font-medium">
          Enter the 6-digit verification code sent to <span className="font-bold text-slate-900">{otpEmail}</span>.
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-semibold" suppressHydrationWarning>
          {error}
        </div>
      )}

      {!requiresOtp ? (
        <>
          <div>
            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              Login ID / Email Address
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:opacity-50 text-sm font-medium transition-shadow"
              placeholder="e.g. president or secretary@example.com"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:opacity-50 text-sm font-medium transition-shadow"
              placeholder="••••••••"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            Verification Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            disabled={isLoading}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2.5 text-center text-xl tracking-[0.2em] font-bold rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:opacity-50 transition-shadow"
            placeholder="000000"
          />
        </div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading || (requiresOtp && otpCode.length !== 6)}
          className="w-full bg-brand hover:bg-brand-deep disabled:opacity-50 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-md shadow-pink-100/50 hover:shadow-lg text-sm"
        >
          {isLoading ? 'Processing...' : requiresOtp ? 'Verify & Sign In' : 'Sign In'}
        </button>

        {requiresOtp && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-brand transition cursor-pointer"
          >
            Back to login credentials
          </button>
        )}
      </div>
    </form>
  );
}
