"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Users, UserPlus, Pencil, X } from "lucide-react";

interface Member {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  phone?: string | null;
  profession?: string | null;
  bio?: string | null;
  boardMembership?: {
    id?: string | null;
    position?: string | null;
    order?: number | null;
  } | null;
}

export default function MembersAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [name, setName] = useState("Rtr. ");
  const [email, setEmail] = useState("");
  const [isBoard, setIsBoard] = useState(false);
  const [position, setPosition] = useState("");
  const [order, setOrder] = useState("1");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(() => {});
  }, []);

  const handleEditClick = (member: Member) => {
    setEditingId(member.id);
    setName(member.name || "");
    setEmail(member.email || "");
    setIsBoard(!!member.boardMembership);
    setPosition(member.boardMembership?.position || "");
    setOrder(String(member.boardMembership?.order || 1));
    setPhone(member.phone || "");
    setProfession(member.profession || "");
    setBio(member.bio || "");
    setAvatar(member.avatar || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setIsBoard(false);
    setPosition("");
    setOrder("1");
    setPhone("");
    setProfession("");
    setBio("");
    setAvatar("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = "/api/admin/members";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name,
          email,
          isBoard,
          position,
          order: Number(order) || 1,
          phone,
          profession,
          bio,
          avatar,
        }),
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      handleCancelEdit();
      fetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await fetch(`/api/admin/members?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      fetchMembers();
    } catch (err: any) {
      alert("Error deleting member: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Members</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and coordinate your club team board and members list</p>
        </div>
        <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>{members.length} Registered</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-purple-700 font-semibold border-b pb-2">
            <UserPlus className="h-5 w-5" />
            <span>{editingId ? "Edit Member / User" : "Add Member / User"}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Paste an Image URL..."
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Or upload:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAvatar(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isBoard"
                checked={isBoard}
                onChange={(e) => setIsBoard(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isBoard" className="text-sm font-medium text-gray-700 cursor-pointer">
                Is a Board Council Member?
              </label>
            </div>

            {isBoard && (
              <div className="space-y-4 bg-purple-50 p-3 rounded border border-purple-100">
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">Board Position *</label>
                  <input
                    type="text"
                    required={isBoard}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full border border-purple-200 bg-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. President, Secretary, Director"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full border border-purple-200 bg-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. +91 99999 99999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Student, Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Short bio details..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded text-sm transition disabled:bg-purple-400 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? "Processing..." : editingId ? "Update Member" : "Save Member"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded text-sm border border-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Registered Members List</h3>

          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No members found in the database. Use the form to add members.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profession</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                            {member.name ? member.name[0].toUpperCase() : "M"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                            {member.phone && <div className="text-xs text-gray-400">{member.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {member.boardMembership?.position || "Member"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.profession || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEditClick(member)}
                          className="text-purple-600 hover:text-purple-900 cursor-pointer"
                          title="Edit Member"
                        >
                          <Pencil className="h-5 w-5 inline" />
                        </button>
                        {(currentUser?.role === "ADMIN" || currentUser?.role === "CLUB_ADMIN") && (
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="h-5 w-5 inline" />
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
