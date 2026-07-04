"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function NewMemberPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("Rtr. ");
  const [email, setEmail] = useState("");
  const [isBoard, setIsBoard] = useState(false);
  const [position, setPosition] = useState("");
  const [order, setOrder] = useState("1");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      setName("Rtr. ");
      setEmail("");
      setIsBoard(false);
      setPosition("");
      setOrder("1");
      setPhone("");
      setProfession("");
      setBio("");
      setAvatar("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-700">Create</span>
          <h1 className="text-3xl font-bold text-gray-900">Add a new member</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            The form is separated from the members overview so profile entry stays focused.
          </p>
        </div>
        <Link href="/admin/members" className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Back to overview
        </Link>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. john@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
          <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Paste an image URL or upload below" />
          <input type="file" accept="image/*" className="mt-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setAvatar(reader.result as string);
              reader.readAsDataURL(file);
            }
          }} />
        </div>

        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" id="isBoard" checked={isBoard} onChange={(e) => setIsBoard(e.target.checked)} className="h-4 w-4 text-purple-600 rounded border-gray-300" />
          <label htmlFor="isBoard" className="text-sm font-medium text-gray-700 cursor-pointer">Is a Board Council Member?</label>
        </div>

        {isBoard && (
          <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50 p-4">
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">Board Position *</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)} required={isBoard} className="w-full rounded border border-purple-200 px-3 py-2 text-sm bg-white" placeholder="President, Secretary, Director" />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">Display Sort Order</label>
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full rounded border border-purple-200 px-3 py-2 text-sm bg-white" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. +91 99999 99999" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
          <input value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. Student, Software Engineer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio Description</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Short bio details..." />
        </div>

        <button type="submit" disabled={submitting} className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2">
          <UserPlus className="h-4 w-4" />
          {submitting ? "Processing..." : "Save Member"}
        </button>
      </form>
    </div>
  );
}
