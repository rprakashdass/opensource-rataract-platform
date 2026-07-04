"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Key, UserCheck } from "lucide-react";

interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: string;
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

  // Form State
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("ADMIN");

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

  const handleEditClick = (account: UserAccount) => {
    setEditingId(account.id);
    setLoginId(account.email || "");
    setName(account.name || "");
    setPassword(""); // Leave empty unless they want to change it
    setRole(account.role || "ADMIN");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setLoginId("");
    setPassword("");
    setName("");
    setRole("ADMIN");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const method = editingId ? "PUT" : "POST";
      const payload = editingId 
        ? { id: editingId, loginId, password, role }
        : { loginId, password, name, role };

      const res = await fetch("/api/admin/accounts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      await fetchAccounts();
      handleCancelEdit();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this internal login account?")) return;
    try {
      const res = await fetch(`/api/admin/accounts?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchAccounts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internal Accounts</h1>
          <p className="text-gray-500 mt-1">Manage login credentials and system access roles.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              {editingId ? "Edit Credentials" : "New Account"}
              {editingId && (
                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              )}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g. John Doe"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Login ID</label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g. admin_nexus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingId && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input
                  type={editingId ? "password" : "text"}
                  required={!editingId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Secure password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
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
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition cursor-pointer font-medium flex justify-center items-center gap-2 mt-4"
              >
                {submitting ? "Saving..." : editingId ? "Update Credentials" : (
                  <><Plus className="h-4 w-4" /> Create Account</>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
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
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {acc.role || "NONE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEditClick(acc)}
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          title="Edit Credentials"
                        >
                          <Pencil className="h-4 w-4 inline" />
                        </button>
                        {(currentUser?.role === "ADMIN" || currentUser?.role === "CLUB_ADMIN") && (
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
    </div>
  );
}
