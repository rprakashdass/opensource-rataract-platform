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
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
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
                    <Button className="w-full gap-2">Go to Dashboard <ArrowRight className="w-4 h-4" /></Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Check-in Failed</h2>
            <p className="text-sm text-slate-500 mb-8">{message}</p>
            
            <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full gap-2">Back to Dashboard <ArrowRight className="w-4 h-4" /></Button>
            </Link>
        </div>
    );
}
