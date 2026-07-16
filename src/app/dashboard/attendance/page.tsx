import { getMemberAttendance } from "@/features/attendance/queries/getMemberAttendance";
import { notFound, redirect } from "next/navigation";
import { ClipboardCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid } from "@/components/portal";

export default async function MemberAttendancePage() {
    const data = await getMemberAttendance();

    if (data.error || !data.memberId) {
        if (data.error === "Unauthorized") redirect("/auth/login");
        return <div className="text-center py-20 text-slate-500">Error loading attendance</div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <PageHeader
                title="My Attendance"
                description="Track your participation and volunteer contributions."
            />

            {/* Stats */}
            <StatGrid className="lg:grid-cols-2">
                <StatCard label="Attendance Rate" value={`${data.attendancePercentage}%`} icon={ClipboardCheck} tone="brand" />
                <StatCard label="Total Volunteer Hours" value={data.totalHours} icon={Clock} tone="positive" />
            </StatGrid>

            {/* History */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">Attendance History</h2>
                </div>
                
                {data.history && data.history.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {data.history.map((record: any) => (
                            <div key={record.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">{record.event.title}</h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        {new Date(record.event.startDate).toLocaleDateString()}
                                        {record.volunteerHours && (
                                            <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                                                +{record.volunteerHours} hrs
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    {record.status === "PRESENT" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex gap-1 items-center"><CheckCircle2 className="w-3 h-3"/> PRESENT</Badge>}
                                    {record.status === "ABSENT" && <Badge variant="destructive" className="flex gap-1 items-center"><XCircle className="w-3 h-3"/> ABSENT</Badge>}
                                    {record.status === "LATE" && <Badge variant="secondary" className="bg-amber-100 text-amber-700 flex gap-1 items-center"><Clock className="w-3 h-3"/> LATE</Badge>}
                                    {record.status === "EXCUSED" && <Badge variant="outline" className="text-slate-600">EXCUSED</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No attendance records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
