"use client";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { PageHeader } from "@/components/portal";

export default function NewAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [loading, setLoading] = useState(true);
  useLoadingToast(loading, "Loading account details...");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  // Form State
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<string[]>(["SUPER_ADMIN"]);

  useEffect(() => {
    if (editId) {
      fetch("/api/admin/accounts")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          const account = data.find((a: any) => a.id === editId);
          if (account) {
            setLoginId(account.email || "");
            setName(account.name || "");
            setPassword("");
            setRoles(account.roles || ['SUPER_ADMIN']);
          } else {
            setError("Account not found");
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [editId]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const method = editId ? "PUT" : "POST";
      const res = await fetch("/api/admin/accounts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      toast.success(editId ? "Account updated!" : "Account created!");
      router.push(`${ROUTES.ADMIN}/accounts`);
      router.refresh();
    },
    onError: (err: any) => {
      setError(err.message);
      toast.error(err.message || "An error occurred");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = editId
      ? { id: editId, loginId, password, roles }
      : { loginId, password, name, roles };

    const loadingToast = toast.loading("Saving...");
    saveMutation.mutate(payload, {
      onSettled: () => toast.dismiss(loadingToast)
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageHeader
        title={editId ? "Edit Credentials" : "New Account"}
        description={editId ? "Update the login credentials and role." : "Create new login credentials for an administrator."}
        backHref={`${ROUTES.ADMIN}/accounts`}
        backLabel="Back to overview"
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!editId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
                placeholder="e.g. John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Login ID *</label>
            <input
              type="text"
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
              placeholder="e.g. admin_nexus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password {!editId && "*"}
              {editId && <span className="text-slate-400 font-normal ml-2 text-xs">(Leave blank to keep current)</span>}
            </label>
            <input
              type={editId ? "password" : "text"}
              required={!editId}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm"
              placeholder="Secure password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">System Roles *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "SUPER_ADMIN", label: "Superadmin" },
                { id: "CLUB_ADMIN", label: "Club Admin" },
                { id: "FINANCE_ADMIN", label: "Finance Admin" },
                { id: "FINANCE_VIEWER", label: "Finance Viewer" },
                { id: "MEMBER", label: "Standard Member" }
              ].map((r) => (
                <label key={r.id} className="flex items-center space-x-3 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={roles.includes(r.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRoles([...roles, r.id]);
                      } else {
                        if (roles.length > 1) { // Ensure at least one role
                          setRoles(roles.filter(id => id !== r.id));
                        } else {
                          toast.error("Account must have at least one role");
                        }
                      }
                    }}
                    className="h-4 w-4 text-brand focus:ring-brand border-slate-300 rounded"
                  />
                  <span className="text-sm font-medium text-slate-900">{r.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Accounts can have multiple roles to combine permissions.</p>
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full bg-brand text-white py-2.5 rounded-lg hover:bg-brand-deep disabled:opacity-50 transition cursor-pointer font-medium flex justify-center items-center gap-2"
          >
            {saveMutation.isPending ? "Saving..." : editId ? "Update Credentials" : (
              <><Plus className="h-4 w-4" /> Create Account</>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
