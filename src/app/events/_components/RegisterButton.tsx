"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function RegisterButton({ eventId, isRegistered }: { eventId: string, isRegistered: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    const toastId = toast.loading("Registering for event...");
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast.success("Successfully registered for event!", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
        <CheckCircle className="h-4 w-4" />
        Registered
      </div>
    );
  }

  return (
    <button
      onClick={handleRegister}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition disabled:opacity-50"
    >
      {loading ? "Registering..." : "Register"}
    </button>
  );
}
