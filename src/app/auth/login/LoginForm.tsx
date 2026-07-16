'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Authentication failed");
      }

      const redirectPath = searchParams.get('redirect');

      if (redirectPath) {
        window.location.href = redirectPath;
      } else {
        window.location.href = ROUTES.DASHBOARD;
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Welcome Back</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-semibold" suppressHydrationWarning>
          {error}
        </div>
      )}

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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand hover:bg-brand-deep disabled:opacity-50 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-md shadow-pink-100/50 hover:shadow-lg text-sm"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
