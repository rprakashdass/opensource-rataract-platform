"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
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
      <div className="w-full rounded-full py-3.5 px-6 text-center bg-paper border border-hairline text-ink text-[15px] font-semibold flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-ochre-deep" /> You&rsquo;re registered
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="w-full rounded-full py-3.5 px-6 text-center bg-paper border border-hairline text-ink-faint text-[15px] font-semibold">
        This event is full
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
    <button
      type="button"
      onClick={handleRegister}
      disabled={loading}
      className="motion-button w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold bg-ochre text-white hover:bg-ochre-deep transition-colors disabled:opacity-60 disabled:pointer-events-none"
    >
      {loading ? "Registering…" : "Register for this event"}
    </button>
  );
}
