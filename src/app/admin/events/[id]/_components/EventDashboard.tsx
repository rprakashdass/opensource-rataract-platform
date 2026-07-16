"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Clock,
  Play,
  Check,
  XCircle,
  Briefcase,
  Percent,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { transitionEvent } from "@/features/events/actions/transitionEvent";
import { saveEventMinutes } from "@/features/events/actions/saveEventMinutes";
import { StatCard, StatGrid, TableWrap, PortalEmptyState } from "@/components/portal";
import EventMediaModeration from "./EventMediaModeration";

interface EventDashboardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    status: string;
    location: string | null;
    startTime: Date;
    endTime: Date | null;
    imageUrl: string | null;
    registrationRequired: boolean;
    registeredCount: number;
    capacity: number | null;
    bannerMediaId: string | null;
    posterMediaId: string | null;
    tags: string[];
    category: string | null;
    project: { title: string } | null;
    registrations: Array<{
      id: string;
      status: string;
      registeredAt: Date;
      member: {
        name: string | null;
        email: string | null;
      };
    }>;
    minutes: {
      content: string;
    } | null;
    attendance: Array<{
      id: string;
      memberId: string;
    }>;
    transactions: Array<{
      id: string;
      title: string;
      amount: any;
      type: string;
      status: string;
    }>;
    media: Array<{
      id: string;
      url: string;
      title: string | null;
      isFeatured: boolean;
      driveFileId: string | null;
    }>;
    driveFolderId: string | null;
  };
}

export default function EventDashboard({ event }: EventDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "attendance" | "finance" | "gallery" | "reports">("overview");
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState(event.minutes?.content || "");

  // Checklist Calculations
  const hasPoster = !!event.imageUrl;
  const hasVenue = !!event.location;
  const registrationConfigured = event.registrationRequired;
  const attendanceCompleted = event.status === "COMPLETED" || event.attendance.length > 0;
  const reportSubmitted = !!event.minutes?.content || !!reportText;

  const totalChecklist = 5;
  const completedChecklist =
    (hasPoster ? 1 : 0) +
    (hasVenue ? 1 : 0) +
    (registrationConfigured ? 1 : 0) +
    (attendanceCompleted ? 1 : 0) +
    (reportSubmitted ? 1 : 0);

  const percentComplete = Math.round((completedChecklist / totalChecklist) * 100);

  async function handleTransition(status: string) {
    setLoading(true);
    try {
      const res = await transitionEvent(event.id, status as any);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Event is now ${status}`);
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to transition event");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAttendance(registrationId: string, currentStatus: string) {
    const isAttending = currentStatus === "ATTENDED";
    try {
      const res = await fetch(`/api/admin/events/${event.id}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId: registrationId, attended: !isAttending })
      });
      if (!res.ok) throw new Error();
      toast.success(isAttending ? "Marked as registered only" : "Checked in successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update check-in status");
    }
  }

  async function handleSaveReport() {
    setLoading(true);
    try {
      const res = await saveEventMinutes(event.id, reportText);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event report submitted successfully!");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to save report");
    } finally {
      setLoading(false);
    }
  }

  const attendedCount = event.registrations.filter(r => r.status === "ATTENDED").length;
  const attendanceRatio = event.registrations.length > 0
    ? `${Math.round((attendedCount / event.registrations.length) * 100)}%`
    : "0%";

  const registrationStatusBadge = (status: string) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
      status === "ATTENDED" ? "bg-emerald-100 text-emerald-700" : "bg-pink-50 text-brand"
    }`}>
      {status}
    </span>
  );

  const transactionStatusBadge = (status: string) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
      status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
    }`}>
      {status}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Switchers (SaaS Style) */}
      <div className="flex border-b border-slate-100 overflow-x-auto hide-scrollbar">
        {(["overview", "registrations", "attendance", "finance", "gallery", "reports"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
              activeTab === tab
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold">Event Lifecycle State</CardTitle>
                    <CardDescription>Transition the event through operational stages.</CardDescription>
                  </div>
                  <span className="bg-pink-50 text-brand text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    {event.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 pt-2">
                  {event.status === "DRAFT" && (
                    <>
                      <Button onClick={() => handleTransition("UPCOMING")} disabled={loading} className="bg-brand hover:bg-brand-deep text-white gap-1.5">
                        <Play className="w-4 h-4 fill-white" /> Publish Event
                      </Button>
                      <Button onClick={() => handleTransition("CANCELLED")} disabled={loading} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5">
                        <XCircle className="w-4 h-4" /> Cancel Event
                      </Button>
                    </>
                  )}
                  {event.status === "UPCOMING" && (
                    <>
                      <Button onClick={() => handleTransition("ONGOING")} disabled={loading} className="bg-amber-600 hover:bg-amber-700 gap-1.5">
                        <Clock className="w-4 h-4" /> Start Event Live
                      </Button>
                      <Button onClick={() => handleTransition("CANCELLED")} disabled={loading} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5">
                        <XCircle className="w-4 h-4" /> Cancel Event
                      </Button>
                    </>
                  )}
                  {event.status === "ONGOING" && (
                    <>
                      <Button onClick={() => handleTransition("COMPLETED")} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Mark Completed
                      </Button>
                      <Button onClick={() => handleTransition("CANCELLED")} disabled={loading} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5">
                        <XCircle className="w-4 h-4" /> Cancel Event
                      </Button>
                    </>
                  )}
                  {(event.status === "COMPLETED" || event.status === "CANCELLED") && (
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" /> Event lifecycle has finished. No further actions required.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logistics Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Start Time</p>
                  <p className="text-sm font-medium text-slate-900 mt-1" suppressHydrationWarning>{new Date(event.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> End Time</p>
                  <p className="text-sm font-medium text-slate-900 mt-1" suppressHydrationWarning>{event.endTime ? new Date(event.endTime).toLocaleString() : "TBD"}</p>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-50">
                  <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Venue Location</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{event.location || "Online/TBD"}</p>
                </div>
                {event.project && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-50">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Linked Project</p>
                    <p className="text-sm font-semibold text-brand mt-1">{event.project.title}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Readiness Checklist */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Readiness Checklist</CardTitle>
                <CardDescription>Track operational completeness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Readiness Progress</span>
                    <span>{percentComplete}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand h-full transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
                  </div>
                </div>

                <ul className="space-y-3.5 pt-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Poster uploaded</span>
                    {hasPoster ? <Check className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-full p-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Venue added</span>
                    {hasVenue ? <Check className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-full p-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Registration configured</span>
                    {registrationConfigured ? <Check className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-full p-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Attendance completed</span>
                    {attendanceCompleted ? <Check className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-full p-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Report submitted</span>
                    {reportSubmitted ? <Check className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-full p-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Registrations Tab */}
      {activeTab === "registrations" && (
        <Card>
          <CardHeader>
            <CardTitle>Event Registrations ({event.registrations.length})</CardTitle>
            <CardDescription>Manage user registration and mark check-ins.</CardDescription>
          </CardHeader>
          <CardContent>
            {event.registrations.length === 0 ? (
              <PortalEmptyState title="No registrations yet" detail="No registrations found for this event yet." />
            ) : (
              <TableWrap
                mobile={event.registrations.map((reg) => (
                  <div key={reg.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{reg.member.name || "Unnamed"}</p>
                        <p className="text-xs text-slate-500 truncate">{reg.member.email || "-"}</p>
                      </div>
                      {registrationStatusBadge(reg.status)}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">Registered {new Date(reg.registeredAt).toLocaleDateString()}</p>
                      <Button
                        size="sm"
                        variant={reg.status === "ATTENDED" ? "outline" : "default"}
                        onClick={() => handleToggleAttendance(reg.id, reg.status)}
                        className="text-xs h-8"
                      >
                        {reg.status === "ATTENDED" ? "Undo Check In" : "Check In"}
                      </Button>
                    </div>
                  </div>
                ))}
              >
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 border-b border-slate-100 font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Date Registered</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Check In Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {event.registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5 font-medium text-slate-900">{reg.member.name || "Unnamed"}</td>
                        <td className="px-5 py-3.5">{reg.member.email || "-"}</td>
                        <td className="px-5 py-3.5">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">{registrationStatusBadge(reg.status)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant={reg.status === "ATTENDED" ? "outline" : "default"}
                            onClick={() => handleToggleAttendance(reg.id, reg.status)}
                            className="text-xs h-8"
                          >
                            {reg.status === "ATTENDED" ? "Undo Check In" : "Check In"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-4">
            <div>
              <CardTitle>Attendance Metrics</CardTitle>
              <CardDescription>Visual breakdown of registered vs checked-in participants.</CardDescription>
            </div>
            <Link href={`/admin/events/${event.id}/attendance`}>
              <Button className="bg-brand hover:bg-brand-deep text-white rounded-xl gap-2 font-semibold w-full sm:w-auto">
                <QrCode className="w-4 h-4" /> Manage Attendance & Session
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <StatGrid className="lg:grid-cols-3">
              <StatCard label="Registered" value={event.registrations.length} icon={Users} tone="neutral" />
              <StatCard label="Attended" value={attendedCount} icon={CheckCircle} tone="positive" />
              <StatCard label="Ratio" value={attendanceRatio} icon={Percent} tone="brand" />
            </StatGrid>
          </CardContent>
        </Card>
      )}

      {/* Finance Tab */}
      {activeTab === "finance" && (
        <Card>
          <CardHeader>
            <CardTitle>Event Finance & Expenditures</CardTitle>
            <CardDescription>Overview of transactions associated with this event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StatGrid className="lg:grid-cols-2">
              <StatCard
                label="Total Income"
                tone="positive"
                value={`₹ ${event.transactions
                  .filter(t => t.type === "INCOME" && t.status === "APPROVED")
                  .reduce((acc, curr) => acc + Number(curr.amount), 0)}`}
              />
              <StatCard
                label="Total Expenses"
                tone="critical"
                value={`₹ ${event.transactions
                  .filter(t => t.type === "EXPENSE" && t.status === "APPROVED")
                  .reduce((acc, curr) => acc + Number(curr.amount), 0)}`}
              />
            </StatGrid>

            {event.transactions.length === 0 ? (
              <PortalEmptyState title="No transactions" detail="No transactions linked to this event." />
            ) : (
              <TableWrap
                mobile={event.transactions.map((t) => (
                  <div key={t.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900 truncate">{t.title}</p>
                      {transactionStatusBadge(t.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{t.type}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">₹ {Number(t.amount).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              >
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 border-b border-slate-100 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Title</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {event.transactions.map((t) => (
                      <tr key={t.id}>
                        <td className="px-5 py-3 font-medium text-slate-900">{t.title}</td>
                        <td className="px-5 py-3">{t.type}</td>
                        <td className="px-5 py-3">₹ {Number(t.amount).toLocaleString()}</td>
                        <td className="px-5 py-3">{transactionStatusBadge(t.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gallery Tab */}
      {activeTab === "gallery" && (() => {
        const bannerThumb = event.media?.find((m) => m.id === event.bannerMediaId) || event.media?.[0];
        return (
        <Card>
          <CardHeader>
            <CardTitle>Event Media & Gallery</CardTitle>
            <CardDescription>View or upload photos from this operational campaign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bannerThumb?.url ? (
              <div className="relative aspect-video max-w-lg rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                <Image
                  src={bannerThumb.url}
                  alt={event.title}
                  fill
                  sizes="512px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="p-12 border border-dashed border-slate-200 rounded-3xl text-center">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-900">No cover image uploaded</p>
                <p className="text-xs text-slate-500 mt-1">Upload a poster via Event Settings to check this task off your readiness list.</p>
              </div>
            )}

            <EventMediaModeration
              eventId={event.id}
              media={event.media}
              driveFolderId={event.driveFolderId}
              bannerMediaId={event.bannerMediaId}
              posterMediaId={event.posterMediaId}
            />
          </CardContent>
        </Card>
        );
      })()}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <Card>
          <CardHeader>
            <CardTitle>Meeting Minutes & Operations Report</CardTitle>
            <CardDescription>Publish the final report of the campaign's outcomes, attendees, and operational minutes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Draft official minutes or submit report findings here..."
              className="min-h-[240px] font-sans text-sm leading-relaxed"
            />
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveReport} disabled={loading} className="bg-brand hover:bg-brand-deep text-white">
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
