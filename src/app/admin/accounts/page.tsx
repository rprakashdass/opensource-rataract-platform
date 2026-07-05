"use client";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Key, UserCheck } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface UserAccount {
  id: string;
  email: string;
  name: string;
  roles: string[];
  member?: {
    id: string;
  } | null;
}

export default function AccountsAdmin() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);



  useLoadingToast(loading, "Loading accounts...");

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/admin/accounts");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this internal login account?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/admin/accounts?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchAccounts();
      toast.success("Deleted", { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-700">Accounts</span>
          <h1 className="text-3xl font-bold text-gray-900">Internal Accounts</h1>
          <p className="text-gray-500 mt-1 max-w-2xl text-sm">
            Manage login credentials and system access roles for all administrators and users.
          </p>
        </div>
        <Link href={`${ROUTES.ADMIN}/accounts/new`} className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition">
          Add Account
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registered Accounts</h2>
            <p className="text-sm text-gray-500">A comprehensive list of all users with login access.</p>
          </div>
        </div>


          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No login accounts found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                            {acc.name?.charAt(0) || "U"}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          {acc.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {acc.roles?.map(r => (
                            <span key={r} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {r.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`${ROUTES.ADMIN}/accounts/new?edit=${acc.id}`}
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          title="Edit Credentials"
                        >
                          <Pencil className="h-4 w-4 inline" />
                        </Link>
                        {((currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('CLUB_ADMIN'))) && (
                          <button
                            onClick={() => handleDelete(acc.id)}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
