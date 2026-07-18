"use client";

import { useState, useOptimistic, startTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { registerForEvent } from "@/features/events/actions/registerForEvent";

interface Props {
  eventId: string;
  memberId: string;
  isRegistered: boolean;
  isFull: boolean;
}

export default function PublicEventRegister({ eventId, memberId, isRegistered, isFull }: Props) {
  const [optimisticRegistered, addOptimisticRegistered] = useOptimistic(
    isRegistered,
    (state, newStatus: boolean) => newStatus
  );

  const [loading, setLoading] = useState(false);

  if (optimisticRegistered) {
    return (
      <div className="w-full rounded-full py-3.5 px-6 text-center bg-paper border border-hairline text-ink text-[15px] font-semibold flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-brand-deep" /> You&rsquo;re registered
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
    startTransition(() => {
      addOptimisticRegistered(true);
    });

    try {
      const res = await registerForEvent(eventId, memberId);
      if (res.error) throw new Error(res.error);
      toast.success("Successfully registered for this event!");
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
      startTransition(() => {
        addOptimisticRegistered(false);
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRegister}
      disabled={loading}
      className="motion-button w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold bg-brand text-white hover:bg-brand-deep transition-colors disabled:opacity-60 disabled:pointer-events-none"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> Registering…
        </>
      ) : (
        "Register for this event"
      )}
    </button>
  );
}
