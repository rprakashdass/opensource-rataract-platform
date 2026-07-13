"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, QrCode, Search, AlertTriangle, Users, Lock, Unlock, Download, MoreHorizontal, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { markAttendance } from "@/features/attendance/actions/markAttendance";
import { bulkMarkAttendance } from "@/features/attendance/actions/bulkMarkAttendance";
import { generateAttendanceSession, invalidateAttendanceSession } from "@/features/attendance/actions/attendanceSession";
import { toggleAttendanceLock } from "@/features/attendance/actions/lockAttendance";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { exportAttendanceCsv } from "@/features/attendance/actions/exportAttendance";
import { useRouter } from "next/navigation";
import { AttendanceStatus } from "@prisma/client";

export default function AttendanceTracker({ event, activeSession }: { event: any, activeSession?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");

  const [qrToken, setQrToken] = useState<string | null>(null);
  const [checkInCode, setCheckInCode] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const checkInUrl = qrToken ? `${origin || "http://localhost:3000"}/attendance/checkin/${qrToken}` : "";
  const qrImageUrl = checkInUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(checkInUrl)}` : "";

  const isLocked = event.isAttendanceLocked;

  const handleMark = async (memberId: string, status: AttendanceStatus) => {
    if (isLocked) return toast.error("Attendance is locked for this event");
    
    setLoading(true);
    try {
      const res = await markAttendance(event.id, memberId, status);
      if (res.error) throw new Error(res.error);
      toast.success(`Marked as ${status}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMark = async (status: AttendanceStatus) => {
    if (isLocked) return toast.error("Attendance is locked for this event");
    if (selectedIds.length === 0) return toast.warning("No members selected");

    setLoading(true);
    try {
      const res = await bulkMarkAttendance(event.id, selectedIds, status);
      if (res.error) throw new Error(res.error);
      toast.success(`Updated ${selectedIds.length} members to ${status}`);
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Bulk update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const res = await generateAttendanceSession(event.id, 120); // 2 hours
      if (res.error) throw new Error(res.error);
      if (res.token) setQrToken(res.token);
      if (res.checkInCode) setCheckInCode(res.checkInCode);
      setShowSessionModal(true);
      toast.success("Attendance Session Started");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const res = await invalidateAttendanceSession(activeSession.id, event.id);
      if (res.error) throw new Error(res.error);
      setShowSessionModal(false);
      setQrToken(null);
      setCheckInCode(null);
      toast.success("Attendance Session Stopped");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to stop session");
    } finally {
      setLoading(false);
    }
  };
  const handleToggleLock = async () => {
    if (!confirm(isLocked ? "Unlock attendance?" : "Lock attendance? This will invalidate active QR codes.")) return;
    setLoading(true);
    try {
      const res = await toggleAttendanceLock(event.id, !isLocked);
      if (res.error) throw new Error(res.error);
      toast.success(isLocked ? "Attendance Unlocked" : "Attendance Locked");
      router.refresh();
    } catch(err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setLoading(true);
    try {
      const res = await exportAttendanceCsv(event.id);
      if (res.error) throw new Error(res.error);
      if (!res.csv) throw new Error("No CSV data generated");
      
      const blob = new Blob([res.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || `attendance_${event.id}.csv`;
      a.click();
      toast.success("CSV Exported");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registeredMembers = event.registrations.filter((r: any) => r.memberId).map((r: any) => {
      const attendanceRecord = event.attendance.find((a: any) => a.memberId === r.memberId);
      return {
          ...r.member,
          attendanceStatus: attendanceRecord?.status || "PENDING",
          checkedInAt: attendanceRecord?.checkedInAt,
          hours: attendanceRecord?.volunteerHours || 0
      };
  });

  const filteredMembers = registeredMembers.filter((m: any) => {
      if (activeTab === "PRESENT" && m.attendanceStatus !== "PRESENT") return false;
      if (activeTab === "ABSENT" && m.attendanceStatus !== "ABSENT") return false;
      return m.name?.toLowerCase().includes(search.toLowerCase());
  });

  const presentCount = registeredMembers.filter((m: any) => m.attendanceStatus === "PRESENT").length;
  const totalCount = registeredMembers.length;
  const percent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
  const totalHours = event.attendance.reduce((acc: number, curr: any) => acc + Number(curr.volunteerHours || 0), 0);

  const toggleSelectAll = () => {
      if (selectedIds.length === filteredMembers.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredMembers.map((m: any) => m.id));
      }
  };

  const toggleSelect = (id: string) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0 shadow-sm md:col-span-2">
            <CardContent className="p-6 flex items-center justify-between h-full">
                <div>
                    <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider mb-1">Turnout</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black">{presentCount}</h3>
                        <span className="text-purple-200 font-medium text-lg">/ {totalCount} registered</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-white">{percent}%</p>
                    <p className="text-xs text-purple-200 font-medium">Attendance Rate</p>
                </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 shadow-sm">
            <CardContent className="p-6 text-center space-y-1 h-full flex flex-col justify-center">
                <p className="text-3xl font-black text-slate-800">{totalHours}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Volunteer Hours</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 shadow-sm">
            <CardContent className="p-6 text-center space-y-3 h-full flex flex-col justify-center">
                {!activeSession ? (
                    <Button 
                        variant="outline" 
                        className="w-full gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                        onClick={handleStartSession}
                        disabled={isLocked || loading}
                    >
                        <QrCode className="w-4 h-4" /> Start Session
                    </Button>
                ) : (
                    <div className="space-y-2">
                        <Button 
                            className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => setShowSessionModal(true)}
                        >
                            <QrCode className="w-4 h-4" /> View Check-in Info
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                            onClick={handleStopSession}
                            disabled={loading}
                        >
                            Stop Session
                        </Button>
                    </div>
                )}
            </CardContent>
          </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1">
              <Button variant={activeTab === "ALL" ? "secondary" : "ghost"} size="sm" onClick={() => setActiveTab("ALL")}>All</Button>
              <Button variant={activeTab === "PRESENT" ? "secondary" : "ghost"} size="sm" onClick={() => setActiveTab("PRESENT")}>Present</Button>
              <Button variant={activeTab === "ABSENT" ? "secondary" : "ghost"} size="sm" onClick={() => setActiveTab("ABSENT")}>Absent</Button>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-slate-600" onClick={handleExportCsv} disabled={loading}>
                  <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </Button>
              <Button variant={isLocked ? "secondary" : "destructive"} size="sm" className="gap-2" onClick={handleToggleLock} disabled={loading}>
                  {isLocked ? <><Unlock className="w-4 h-4" /> Unlock</> : <><Lock className="w-4 h-4" /> Lock</>}
              </Button>
          </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between items-center bg-slate-50 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                {selectedIds.length > 0 ? (
                    <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">
                        <span className="text-sm font-bold text-purple-800">{selectedIds.length} selected</span>
                        <div className="w-px h-4 bg-purple-300 mx-1"></div>
                        <Button size="sm" variant="ghost" className="h-7 text-green-700 hover:text-green-800 hover:bg-green-200" onClick={() => handleBulkMark("PRESENT")}>Mark Present</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-red-700 hover:text-red-800 hover:bg-red-200" onClick={() => handleBulkMark("ABSENT")}>Mark Absent</Button>
                    </div>
                ) : (
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" /> Member Roster
                    </h3>
                )}
            </div>
            
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Search roster..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
            </div>
        </div>

        {filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                No members found in the roster.
            </div>
        ) : (
            <>
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                                <th className="p-4 w-12 text-center">
                                    <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredMembers.length} onChange={toggleSelectAll} className="rounded text-purple-600 focus:ring-purple-500 border-slate-300" />
                                </th>
                                <th className="p-4">Member</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Check-in Time</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMembers.map((member: any) => (
                                <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(member.id) ? 'bg-purple-50/30' : ''}`}>
                                    <td className="p-4 text-center">
                                        <input type="checkbox" checked={selectedIds.includes(member.id)} onChange={() => toggleSelect(member.id)} className="rounded text-purple-600 focus:ring-purple-500 border-slate-300" />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <MemberAvatar name={member.name} avatarUrl={member.avatar} className="w-8 h-8 border border-slate-200" textClassName="text-xs" />
                                            <div>
                                                <p className="font-semibold text-slate-900">{member.name}</p>
                                                <p className="text-xs text-slate-500">{member.email || "No email"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {member.attendanceStatus === "PRESENT" && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Present</Badge>}
                                        {member.attendanceStatus === "ABSENT" && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Absent</Badge>}
                                        {member.attendanceStatus === "LATE" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Late</Badge>}
                                        {member.attendanceStatus === "EXCUSED" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Excused</Badge>}
                                        {member.attendanceStatus === "PENDING" && <Badge variant="outline" className="text-slate-400">Pending</Badge>}
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {member.checkedInAt ? new Date(member.checkedInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-green-600 hover:bg-green-50" disabled={loading || isLocked} onClick={() => handleMark(member.id, "PRESENT")}>
                                                <CheckCircle2 className="w-5 h-5" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" disabled={loading || isLocked} onClick={() => handleMark(member.id, "ABSENT")}>
                                                <XCircle className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                    {filteredMembers.map((member: any) => (
                        <div key={member.id} className={`p-4 space-y-3 ${selectedIds.includes(member.id) ? 'bg-purple-50/30' : ''}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={selectedIds.includes(member.id)} onChange={() => toggleSelect(member.id)} className="rounded text-purple-600 focus:ring-purple-500 border-slate-300" />
                                    <MemberAvatar name={member.name} avatarUrl={member.avatar} className="w-10 h-10 border border-slate-200" textClassName="text-sm" />
                                    <div>
                                        <p className="font-semibold text-slate-900 text-base">{member.name}</p>
                                        <p className="text-sm text-slate-500">{member.email || "No email"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex gap-2 items-center">
                                    {member.attendanceStatus === "PRESENT" && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Present</Badge>}
                                    {member.attendanceStatus === "ABSENT" && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Absent</Badge>}
                                    {member.attendanceStatus === "LATE" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Late</Badge>}
                                    {member.attendanceStatus === "EXCUSED" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Excused</Badge>}
                                    {member.attendanceStatus === "PENDING" && <Badge variant="outline" className="text-slate-400">Pending</Badge>}
                                    <span className="text-xs text-slate-500">{member.checkedInAt ? new Date(member.checkedInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}</span>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-green-600 hover:bg-green-50" disabled={loading || isLocked} onClick={() => handleMark(member.id, "PRESENT")}>
                                        <CheckCircle2 className="w-5 h-5" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" disabled={loading || isLocked} onClick={() => handleMark(member.id, "ABSENT")}>
                                        <XCircle className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
      </div>

      {showSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-8 text-center space-y-6">
                      <div>
                          <h3 className="text-2xl font-black text-slate-900">Attendance Session</h3>
                          <p className="text-slate-500 mt-2 font-medium">Members can scan the QR code or enter the 6-digit PIN on their dashboard to check in.</p>
                      </div>

                      {origin && (origin.includes("localhost") || origin.includes("127.0.0.1")) && (
                          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs font-medium text-left leading-relaxed flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                  <span className="font-bold">Local Development:</span> Mobile scanners cannot resolve "localhost". Access this admin page using your network IP (e.g. from the terminal `npm run dev` output) so phones on the same Wi-Fi can scan successfully.
                              </div>
                          </div>
                      )}
                      
                      <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                          <p className="text-purple-700 font-bold uppercase tracking-wider text-xs mb-2">Check-in PIN</p>
                          <div className="text-5xl font-black text-purple-900 tracking-[0.2em]">{checkInCode || "------"}</div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                          {qrToken ? (
                              <img 
                                  src={qrImageUrl}
                                  alt="Check-in QR Code"
                                  className="w-32 h-32 mb-4 bg-white border border-slate-200 p-1 rounded-xl shadow-sm select-none"
                              />
                          ) : (
                              <div className="flex flex-col items-center justify-center text-center p-2 mb-2">
                                  <QrCode className="w-16 h-16 text-slate-300 mb-2" />
                                  <p className="text-[10px] text-amber-600 font-bold max-w-[200px] leading-relaxed">
                                      QR Code hidden for security. To display a new QR code to members, please stop and restart the session.
                                  </p>
                              </div>
                          )}
                          <p className="text-xs font-bold text-slate-500 uppercase">Scan to check in</p>
                          {qrToken && (
                              <button 
                                  onClick={() => {
                                      navigator.clipboard.writeText(checkInUrl);
                                      toast.success("Check-in link copied to clipboard");
                                  }} 
                                  className="text-purple-600 font-bold hover:underline mt-2 text-xs"
                              >
                                  Copy Link
                              </button>
                          )}
                      </div>
                      
                      <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowSessionModal(false)}>Close</Button>
                          <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleStopSession} disabled={loading}>Stop Session</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
