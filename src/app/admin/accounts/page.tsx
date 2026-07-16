"use client";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Key, UserCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import FilterBar from "@/components/admin/FilterBar";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { PageHeader, TableWrap } from "@/components/portal";

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
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";


  const { data: accounts = [], isLoading: loading, error: queryError } = useQuery<UserAccount[]>({
    queryKey: ['admin-accounts'],
    queryFn: async () => {
      const res = await fetch("/api/admin/accounts");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    }
  });
  const error = queryError?.message || "";

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    }
  });

  useLoadingToast(loading, "Loading accounts...");

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/accounts?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      toast.success("Account deleted!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete account");
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this internal login account?")) return;
    deleteMutation.mutate(id);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch = search 
      ? (acc.name?.toLowerCase().includes(search.toLowerCase()) || acc.email.toLowerCase().includes(search.toLowerCase())) 
      : true;
    const matchesStatus = status ? acc.roles.includes(status) : true;
    return matchesSearch && matchesStatus;
  });

  const roleOptions = [
    { label: "Admin", value: "ADMIN" },
    { label: "Club Admin", value: "CLUB_ADMIN" },
    { label: "Finance Admin", value: "FINANCE_ADMIN" },
    { label: "Treasurer", value: "TREASURER" },
    { label: "Secretary", value: "SECRETARY" },
    { label: "Member", value: "MEMBER" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="Login Accounts"
        description="Manage who can log into the platform. Connect these logins to member profiles for complete access."
        actions={
          <Link href={`${ROUTES.ADMIN}/accounts/new`} className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep transition-colors">
            Create Account
          </Link>
        }
      />

      <FilterBar 
        placeholder="Search by name or email..." 
        showStatusFilter 
        statusOptions={roleOptions} 
      />

      <section className="space-y-6">
        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-lg border border-rose-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Registered Accounts</h2>
            <p className="text-sm text-slate-500 mt-1">A comprehensive list of all users with login access.</p>
          </div>

          {loading ? (
            <div className="text-center py-16 rounded-xl border border-slate-200 bg-white">
              <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading accounts...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-slate-200 bg-white">
              <Key className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No login accounts found matching criteria.</p>
            </div>
          ) : (
            <TableWrap
              mobile={filteredAccounts.map((acc) => (
                <div key={acc.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center text-brand font-bold text-sm shrink-0">
                      {acc.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{acc.name}</p>
                      <p className="text-sm text-slate-500 truncate">{acc.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {acc.roles?.map(r => (
                      <span key={r} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600">
                        {r.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`${ROUTES.ADMIN}/accounts/new?edit=${acc.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-pink-50 text-brand hover:bg-pink-100 hover:text-brand-deep transition-colors cursor-pointer"
                      title="Edit Credentials"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {((currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('CLUB_ADMIN'))) && (
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            >
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Login ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center text-brand font-bold text-sm">
                            {acc.name?.charAt(0) || "U"}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors">{acc.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                          <UserCheck className="h-4 w-4 text-slate-400" />
                          {acc.email}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {acc.roles?.map(r => (
                            <span key={r} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600">
                              {r.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`${ROUTES.ADMIN}/accounts/new?edit=${acc.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-pink-50 text-brand hover:bg-pink-100 hover:text-brand-deep transition-colors cursor-pointer"
                          title="Edit Credentials"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {((currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('CLUB_ADMIN'))) && (
                          <button
                            onClick={() => handleDelete(acc.id)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </div>
      </section>
    </div>
  );
}
