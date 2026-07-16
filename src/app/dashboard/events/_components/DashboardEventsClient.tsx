"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, CheckCircle2, Clock, QrCode } from "lucide-react";
import { toast } from "sonner";
import { registerForEvent } from "@/features/events/actions/registerForEvent";
import { memberPinCheckIn } from "@/features/attendance/actions/attendanceSession";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type EventTab = "AVAILABLE" | "REGISTERED" | "CHECK_IN_AVAILABLE" | "ATTENDED" | "COMPLETED";

export default function DashboardEventsClient({ 
    available, 
    registered, 
    checkInAvailable,
    attended, 
    completed,
    memberId
}: {
    available: any[],
    registered: any[],
    checkInAvailable: any[],
    attended: any[],
    completed: any[],
    memberId: string
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<EventTab>("AVAILABLE");
    const [loading, setLoading] = useState<string | null>(null);
    const [checkInModal, setCheckInModal] = useState<{ isOpen: boolean, eventId: string | null }>({ isOpen: false, eventId: null });
    const [pin, setPin] = useState("");

    const handleRegister = async (eventId: string) => {
        setLoading(eventId);
        try {
            const res = await registerForEvent(eventId, memberId);
            if (res.error) throw new Error(res.error);
            toast.success("Successfully registered!");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Registration failed");
        } finally {
            setLoading(null);
        }
    };

    const handleCheckIn = async () => {
        if (!checkInModal.eventId || pin.length !== 6) return;
        setLoading(checkInModal.eventId);
        try {
            const res = await memberPinCheckIn(checkInModal.eventId, pin);
            if (res.error) throw new Error(res.error);
            toast.success("Check-in successful! Welcome.");
            setCheckInModal({ isOpen: false, eventId: null });
            setPin("");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Check-in failed");
        } finally {
            setLoading(null);
        }
    };

    const tabs = [
        { id: "AVAILABLE", label: "Available", count: available.length },
        { id: "REGISTERED", label: "Registered", count: registered.length },
        { id: "CHECK_IN_AVAILABLE", label: "Check In", count: checkInAvailable.length },
        { id: "ATTENDED", label: "Attended", count: attended.length },
        { id: "COMPLETED", label: "Completed", count: completed.length },
    ];

    const getActiveEvents = () => {
        switch (activeTab) {
            case "AVAILABLE": return available;
            case "REGISTERED": return registered;
            case "CHECK_IN_AVAILABLE": return checkInAvailable;
            case "ATTENDED": return attended;
            case "COMPLETED": return completed;
            default: return [];
        }
    };

    return (
        <div className="space-y-6">
            
            <div className="flex overflow-x-auto pb-2 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex bg-slate-100/80 backdrop-blur p-1 rounded-full border border-slate-200/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as EventTab)}
                            className={`snap-start shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                                activeTab === tab.id 
                                    ? "bg-white text-brand shadow-sm border border-slate-200/50"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? "bg-pink-100 text-brand" : "bg-slate-200 text-slate-500"}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getActiveEvents().length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
                        <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">No events found</h3>
                        <p className="text-slate-500">There are no events in this category right now.</p>
                    </div>
                ) : (
                    getActiveEvents().map((event: any) => (
                        <Card key={event.id} className="overflow-hidden rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="p-5">
                                    <Badge variant="secondary" className="mb-3 bg-slate-100 text-slate-600 border-none">{activeTab}</Badge>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{event.title}</h3>
                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center text-sm text-slate-500">
                                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                            <span suppressHydrationWarning>{new Date(event.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500">
                                            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                            {event.location || "TBA"}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-5 pt-0 mt-2">
                                    {activeTab === "AVAILABLE" && (
                                        <Button 
                                            className="w-full rounded-xl"
                                            onClick={() => handleRegister(event.id)}
                                            disabled={loading === event.id}
                                        >
                                            {loading === event.id ? "Registering..." : "Register Now"}
                                        </Button>
                                    )}
                                    {activeTab === "REGISTERED" && (
                                        <Link href={`/dashboard/events/${event.id}`}>
                                            <Button variant="secondary" className="w-full rounded-xl">View Details</Button>
                                        </Link>
                                    )}
                                    {activeTab === "CHECK_IN_AVAILABLE" && (
                                        <div className="space-y-2">
                                            <Button 
                                                className="w-full rounded-xl bg-brand hover:bg-brand-deep text-white"
                                                onClick={() => setCheckInModal({ isOpen: true, eventId: event.id })}
                                            >
                                                <QrCode className="w-4 h-4 mr-2" />
                                                I'm Here / Check In
                                            </Button>
                                            <Link href={`/dashboard/events/${event.id}`}>
                                                <Button variant="outline" className="w-full rounded-xl border-slate-200">Details</Button>
                                            </Link>
                                        </div>
                                    )}
                                    {activeTab === "ATTENDED" && (
                                        <div className="space-y-2">
                                            <div className="bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Checked In
                                            </div>
                                            <Link href={`/dashboard/events/${event.id}`}>
                                                <Button variant="outline" className="w-full rounded-xl border-slate-200">View Volunteer Hours</Button>
                                            </Link>
                                        </div>
                                    )}
                                    {activeTab === "COMPLETED" && (
                                        <Link href={`/dashboard/events/${event.id}`}>
                                            <Button variant="secondary" className="w-full rounded-xl">View Event</Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Check-In Modal */}
            <Dialog open={checkInModal.isOpen} onOpenChange={(open) => {
                setCheckInModal({ isOpen: open, eventId: open ? checkInModal.eventId : null });
                if (!open) setPin("");
            }}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Event Check-in</DialogTitle>
                        <DialogDescription>
                            Enter the 6-digit PIN displayed by the event organizers to check in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <Input 
                            type="text" 
                            placeholder="e.g. 123456" 
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="text-center text-3xl font-bold tracking-[0.2em] h-16 rounded-2xl"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckInModal({ isOpen: false, eventId: null })} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleCheckIn} disabled={pin.length !== 6 || loading !== null} className="rounded-xl">
                            {loading ? "Verifying..." : "Check In"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
