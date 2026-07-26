"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { registerForEvent } from "@/features/events/actions/registerForEvent";
import { memberPinCheckIn } from "@/features/attendance/actions/attendanceSession";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EventActionsProps {
  eventId: string;
  memberId: string;
  state: string; // "AVAILABLE" | "REGISTERED" | "CHECK_IN_AVAILABLE" | "ATTENDED" | "COMPLETED"
  volunteerHours?: string | null;
}

export default function EventActions({ eventId, memberId, state, volunteerHours }: EventActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await registerForEvent(eventId, memberId);
      if (res.error) throw new Error(res.error);
      toast.success("Successfully registered for the event!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 6) return toast.error("Please enter a valid 6-digit PIN");
    
    setLoading(true);
    try {
      const res = await memberPinCheckIn(eventId, pin);
      if (res.error) throw new Error(res.error);
      toast.success("Check-in successful!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  if (state === "AVAILABLE") {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
        <p className="text-sm text-slate-600 mb-3 font-medium">Join this event to participate.</p>
        <Button 
          onClick={handleRegister} 
          disabled={loading}
          className="w-full sm:w-auto rounded-xl"
        >
          {loading ? "Registering..." : "Register Now"}
        </Button>
      </div>
    );
  }

  if (state === "CHECK_IN_AVAILABLE") {
    return (
      <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100 text-center">
        <QrCode className="w-8 h-8 text-brand mx-auto mb-2" />
        <h3 className="font-bold text-brand-deep mb-1">Check-in is open!</h3>
        <p className="text-sm text-brand-deep mb-4">You can now mark your attendance for this event.</p>
        
        {!showPinInput ? (
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              onClick={() => setShowPinInput(true)} 
              className="w-full sm:w-auto bg-brand hover:bg-brand-deep rounded-xl text-white"
            >
              Enter 6-Digit PIN
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCheckIn} className="max-w-xs mx-auto space-y-3">
            <input 
              type="text" 
              maxLength={6}
              placeholder="000000"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-2xl tracking-[0.3em] font-bold text-brand-deep py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPinInput(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || pin.length !== 6}
                className="flex-1 bg-brand hover:bg-brand-deep rounded-xl text-white"
              >
                {loading ? "..." : "Check In"}
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (state === "ATTENDED") {
    return (
      <div className="p-6 bg-green-50 rounded-2xl border border-green-100 text-center flex flex-col items-center">
        <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
        <h3 className="font-bold text-green-900">Attendance Recorded</h3>
        <p className="text-sm text-green-700 mt-1">
          Volunteer Hours: <span className="font-bold">{volunteerHours || "0"}</span>
        </p>
      </div>
    );
  }

  if (state === "REGISTERED") {
    return (
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
        <h3 className="font-bold text-amber-900 mb-1">You are registered!</h3>
        <p className="text-sm text-amber-700">Please wait for the event organizer to open check-in.</p>
      </div>
    );
  }

  if (state === "COMPLETED") {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
        <h3 className="font-bold text-slate-800 mb-1">Event Completed</h3>
        <p className="text-sm text-slate-500">This event has already ended.</p>
      </div>
    );
  }

  return null;
}
