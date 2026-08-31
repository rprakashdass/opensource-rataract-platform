'use client';

import { FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google is the primary sign-in path; the password form is a secondary
  // option tucked behind this toggle so it doesn't compete for attention.
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Surface errors returned from the Google OAuth callback via ?error= param
  const OAUTH_ERRORS: Record<string, string> = {
    google_cancelled: "Google sign-in was cancelled.",
    google_no_code: "Google sign-in failed — no authorisation code received.",
    google_not_configured: "Google sign-in is not configured on this server.",
    google_no_email: "Google did not return an email address.",
    google_not_registered: "This Google account is not registered on the portal. Contact your club administrator.",
    account_inactive: "Your account has been deactivated. Contact your club administrator.",
    google_failed: "Google sign-in failed. Please try again.",
  };

  const oauthError = searchParams.get("error");
  const resolvedError = error || (oauthError ? (OAUTH_ERRORS[oauthError] ?? "An error occurred. Please try again.") : null);

  // If Google sign-in failed in a way password login can route around,
  // surface the password form automatically instead of leaving a dead end.
  useEffect(() => {
    if (oauthError) setShowPasswordForm(true);
  }, [oauthError]);

  const handleGoogleSignIn = () => {
    const redirect = searchParams.get("redirect") || "";
    const url = `/api/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;
    window.location.href = url;
  };

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
    <div className="space-y-6">
      {requiresOtp && (
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
            Security Verification
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-2">
            Enter the 6-digit verification code sent to <span className="font-bold text-slate-900">{otpEmail}</span>.
          </p>
        </div>
      )}

      {!requiresOtp && showPasswordForm && (
        <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight text-center">
          Welcome Back
        </h2>
      )}

      {resolvedError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-semibold" suppressHydrationWarning>
          {resolvedError}
        </div>
      )}

      {!requiresOtp && !showPasswordForm && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-brand/20 hover:border-brand/40 disabled:opacity-50 text-slate-800 font-bold py-4 rounded-xl transition cursor-pointer shadow-lg shadow-brand/10 hover:shadow-xl hover:shadow-brand/15 text-[15px]"
          >
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-slate-500 px-2 leading-relaxed">
            Instant, secure sign-in with club Google account.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => setShowPasswordForm(true)}
            className="w-full text-center text-sm font-semibold text-slate-500 hover:text-brand transition cursor-pointer"
          >
            Sign in with password instead
          </button>
        </div>
      )}

      {(requiresOtp || showPasswordForm) && (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  autoFocus
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

            {requiresOtp ? (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-brand transition cursor-pointer"
              >
                Back to login credentials
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                disabled={isLoading}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-brand transition cursor-pointer"
              >
                ← Back to Google sign-in
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
