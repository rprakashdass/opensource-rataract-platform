"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { memberPinCheckIn } from "@/features/attendance/actions/attendanceSession";
import { useRouter } from "next/navigation";

interface DashboardCheckInCardProps {
  event: {
    id: string;
    title: string;
  };
}

export default function DashboardCheckInCard({ event }: DashboardCheckInCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 6) {
      return toast.error("Please enter a valid 6-digit PIN");
    }

    setLoading(true);
    try {
      const res = await memberPinCheckIn(event.id, pin);
      if (res.error) throw new Error(res.error);
      toast.success("Attendance checked in successfully!");
      setShowPinInput(false);
      setPin("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-brand to-brand-deep rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col gap-3 justify-between">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <MapPin className="w-20 h-20" />
      </div>

      <div className="relative z-10">
        <p className="text-white/80 font-semibold text-xs mb-1 uppercase tracking-wider">Ongoing Right Now</p>
        <h3 className="text-lg font-bold leading-tight">{event.title}</h3>
      </div>

      <div className="relative z-10 w-full mt-2">
        {!showPinInput ? (
          <Button
            onClick={() => setShowPinInput(true)}
            className="w-full bg-white text-brand hover:bg-slate-50 rounded-xl font-bold border-none"
          >
            I'm Here / Check In
          </Button>
        ) : (
          <form onSubmit={handleCheckIn} className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-Digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-lg tracking-[0.2em] font-bold text-brand-deep py-2.5 rounded-xl border border-transparent bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPinInput(false);
                  setPin("");
                }}
                className="flex-1 rounded-xl border-white/20 hover:bg-white/10 bg-transparent text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || pin.length !== 6}
                className="flex-1 bg-white text-brand hover:bg-slate-50 rounded-xl font-bold border-none"
              >
                {loading ? "Checking..." : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
