"use client";

import { useEffect, useState } from "react";
import { qrCheckIn } from "@/features/attendance/actions/attendanceSession";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QRCheckInHandler({ token }: { token: string }) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [eventTitle, setEventTitle] = useState("");

    useEffect(() => {
        let mounted = true;

        const processCheckIn = async () => {
            try {
                const res = await qrCheckIn(token);
                if (!mounted) return;

                if (res.error) {
                    setStatus("error");
                    setMessage(res.error);
                } else if (res.success && res.event) {
                    setStatus("success");
                    setMessage("You have been successfully checked in.");
                    setEventTitle(res.event.title);
                }
            } catch (err: any) {
                if (mounted) {
                    setStatus("error");
                    setMessage("An unexpected error occurred.");
                }
            }
        };

        processCheckIn();

        return () => { mounted = false; };
    }, [token]);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-4"></div>
                <p className="font-semibold text-slate-700">Verifying...</p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Check-in Successful!</h2>
                <p className="text-slate-600 font-medium mb-4">{eventTitle}</p>
                <p className="text-sm text-slate-500 mb-8">{message}</p>
                
                <Link href="/dashboard" className="w-full">
                    <Button className="w-full gap-2 bg-brand hover:bg-brand-deep text-white border-none font-semibold">Back to Dashboard <ArrowRight className="w-4 h-4" /></Button>
                </Link>
            </div>
        );
    }

    const isExpired = message.includes("expired") || message.includes("deactivated");
    const isLocked = message.includes("locked");

    return (
        <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isExpired ? 'bg-orange-100' : isLocked ? 'bg-slate-100' : 'bg-red-100'}`}>
                {isExpired ? (
                    <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : isLocked ? (
                    <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
                {isExpired ? "Token Expired" : isLocked ? "Check-in Locked" : "Check-in Failed"}
            </h2>
            <p className="text-sm text-slate-500 mb-8">{message}</p>
            
            <Link href="/dashboard" className="w-full">
                <Button variant={isLocked || isExpired ? "secondary" : "outline"} className="w-full gap-2">
                    Back to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
            </Link>
        </div>
    );
}
