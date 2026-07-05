'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
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

      // Redirect based on role
      if (data.roles?.some(r => ['ADMIN', 'CLUB_ADMIN', 'FINANCE_ADMIN'].includes(r))) {
        router.push(ROUTES.ADMIN);
      } else {
        router.push("/");
      }
      
      // Refresh page context/state
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>

      {error && (
        <div className="bg-red-55 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-slate-700 text-sm font-semibold mb-2">
          Login ID / Email Address
        </label>
        <input
          type="text"
          required
          disabled={isLoading}
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
          placeholder="e.g. member_pres or you@example.com"
        />
      </div>

      <div>
        <label className="block text-slate-700 text-sm font-semibold mb-2">
          Password
        </label>
        <input
          type="password"
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition cursor-pointer shadow-md shadow-purple-200"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
