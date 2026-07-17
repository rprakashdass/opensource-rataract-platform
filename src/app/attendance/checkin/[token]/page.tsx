import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import QRCheckInHandler from "./_components/QRCheckInHandler";
import { ClipboardCheck } from "lucide-react";

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function CheckInPage({ params }: PageProps) {
    const { token } = await params;
    const session = await getSession();

    // If not logged in, redirect to login with callback
    if (!session || !session.id) {
        const callbackUrl = encodeURIComponent(`/attendance/checkin/${token}`);
        redirect(`/auth/login?callbackUrl=${callbackUrl}`);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 text-center">
                <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClipboardCheck className="w-10 h-10 text-brand" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Event Check-in</h1>
                <p className="text-slate-500 mb-8">Please wait while we verify your attendance...</p>
                
                <QRCheckInHandler token={token} />
            </div>
        </div>
    );
}
