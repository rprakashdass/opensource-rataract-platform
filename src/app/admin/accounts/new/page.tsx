"use client";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NewAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [loading, setLoading] = useState(true);
  useLoadingToast(loading, "Loading account details...");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("ADMIN");

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
            setRole(account.role || "ADMIN");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving...");
    setSubmitting(true);
    setError("");

    try {
      const method = editId ? "PUT" : "POST";
      const payload = editId
        ? { id: editId, loginId, password, role }
        : { loginId, password, name, role };

      const res = await fetch("/api/admin/accounts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Saved successfully", { id: loadingToast });
      router.push(`${ROUTES.ADMIN}/accounts`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-700">Accounts</span>
          <h1 className="text-3xl font-bold text-gray-900">{editId ? "Edit Credentials" : "New Account"}</h1>
          <p className="text-sm text-gray-500 max-w-xl">
            {editId ? "Update the login credentials and role." : "Create new login credentials for an administrator."}
          </p>
        </div>
        <Link
          href={`${ROUTES.ADMIN}/accounts`}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Back to overview
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!editId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                placeholder="e.g. John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login ID *</label>
            <input
              type="text"
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              placeholder="e.g. admin_nexus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!editId && "*"}
              {editId && <span className="text-gray-400 font-normal ml-2 text-xs">(Leave blank to keep current)</span>}
            </label>
            <input
              type={editId ? "password" : "text"}
              required={!editId}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              placeholder="Secure password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
            >
              <option value="ADMIN">Superadmin</option>
              <option value="CLUB_ADMIN">Club Admin</option>
              <option value="FINANCE_ADMIN">Finance Admin</option>
              <option value="FINANCE_VIEWER">Finance Viewer</option>
              <option value="MEMBER">Standard Member</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition cursor-pointer font-medium flex justify-center items-center gap-2"
          >
            {submitting ? "Saving..." : editId ? "Update Credentials" : (
              <><Plus className="h-4 w-4" /> Create Account</>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
