'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Placeholder implementation
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setError('Login coming soon in Sprint 2 - Authentication');
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Welcome Back</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          required
          disabled={isLoading}
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          required
          disabled={isLoading}
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 rounded transition"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="text-center text-gray-400 text-sm">
        Don't have an account?{' '}
        <Link href={ROUTES.SIGNUP} className="text-purple-400 hover:text-purple-300">
          Sign up
        </Link>
      </div>
    </form>
  );
}
