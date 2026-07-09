"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerForEvent } from "@/features/events/actions/registerForEvent";

interface Props {
  eventId: string;
  memberId: string;
  isRegistered: boolean;
  isFull: boolean;
}

export default function PublicEventRegister({ eventId, memberId, isRegistered, isFull }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isRegistered) {
    return (
      <div className="w-full rounded-full py-4 text-center bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold flex items-center justify-center gap-2">
        <CheckCircle2 className="w-5 h-5" /> You're registered!
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="w-full rounded-full py-4 text-center bg-slate-100 border border-slate-200 text-slate-500 font-bold">
        Event Full
      </div>
    );
  }

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await registerForEvent(eventId, memberId);
      if (res.error) throw new Error(res.error);
      toast.success("Successfully registered for this event!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRegister}
      disabled={loading}
      className="w-full rounded-full py-6 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-1"
    >
      {loading ? "Registering..." : "Register for this Event"}
    </Button>
  );
}
