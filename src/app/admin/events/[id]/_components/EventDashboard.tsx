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
  Check,
  XCircle,
  Briefcase,
  Percent,
  QrCode,
  MoreHorizontal,
  ArrowRight,
  FileText,
  Camera,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { transitionEvent } from "@/features/events/actions/transitionEvent";
import { saveEventMinutes } from "@/features/events/actions/saveEventMinutes";
import { StatCard, StatGrid, TableWrap, PortalEmptyState } from "@/components/portal";
import EventMediaModeration from "./EventMediaModeration";

// ─── Types ──────────────────────────────────────────────────────────────────────

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

// ─── Lifecycle Steps ─────────────────────────────────────────────────────────

const LIFECYCLE_STEPS = [
  { key: "DRAFT", label: "Draft" },
  { key: "UPCOMING", label: "Published" },
  { key: "ONGOING", label: "Ongoing" },
  { key: "COMPLETED", label: "Completed" },
] as const;

type LifecycleKey = (typeof LIFECYCLE_STEPS)[number]["key"];

function getStepIndex(status: string): number {
  const idx = LIFECYCLE_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionToggle({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

function ChecklistItem({
  label,
  done,
}: {
  label: string;
  done: boolean;
}) {
  return (
    <li className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className={`text-sm ${done ? "text-slate-500 line-through" : "text-slate-700"}`}>
        {label}
      </span>
      {done ? (
        <Check className="w-5 h-5 text-emerald-500" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-400" />
      )}
    </li>
  );
}

function RegistrationStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
        status === "ATTENDED"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-pink-50 text-brand"
      }`}
    >
      {status}
    </span>
  );
}

function TransactionStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
        status === "APPROVED"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

// ─── Compact Details Card (always visible) ────────────────────────────────────

function DetailsCard({ event }: { event: EventDashboardProps["event"] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Event details</p>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Clock className="w-3 h-3" /> Start
          </dt>
          <dd className="text-sm font-semibold text-slate-900" suppressHydrationWarning>
            {new Date(event.startTime).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Clock className="w-3 h-3" /> End
          </dt>
          <dd className="text-sm font-semibold text-slate-900" suppressHydrationWarning>
            {event.endTime ? new Date(event.endTime).toLocaleString() : "TBD"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <MapPin className="w-3 h-3" /> Venue
          </dt>
          <dd className="text-sm font-semibold text-slate-900">
            {event.location || "Online / TBD"}
          </dd>
        </div>
        {event.project && (
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <Briefcase className="w-3 h-3" /> Project
            </dt>
            <dd className="text-sm font-semibold text-brand">{event.project.title}</dd>
          </div>
        )}
        {event.type && (
          <div>
            <dt className="text-xs text-slate-400 font-medium mb-1">Type</dt>
            <dd className="text-sm font-semibold text-slate-700">
              {event.type.replace(/_/g, " ")}
            </dd>
          </div>
        )}
        {event.capacity && (
          <div>
            <dt className="text-xs text-slate-400 font-medium mb-1">Capacity</dt>
            <dd className="text-sm font-semibold text-slate-700">{event.capacity}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

// ─── Lifecycle Stepper ────────────────────────────────────────────────────────

function LifecycleStepper({
  status,
  onTransition,
  loading,
  eventId,
}: {
  status: string;
  onTransition: (s: string) => void;
  loading: boolean;
  eventId: string;
}) {
  const isCancelled = status === "CANCELLED";
  const currentIdx = isCancelled ? -1 : getStepIndex(status);

  // Primary CTA per stage
  const primaryAction: Record<string, { label: string; next: string; icon?: React.ReactNode }> = {
    DRAFT: {
      label: "Publish event",
      next: "UPCOMING",
      icon: <ArrowRight className="w-4 h-4" />,
    },
    PLANNING: {
      label: "Publish event",
      next: "UPCOMING",
      icon: <ArrowRight className="w-4 h-4" />,
    },
    UPCOMING: {
      label: "Start check-in",
      next: "ONGOING",
      icon: <QrCode className="w-4 h-4" />,
    },
    ONGOING: {
      label: "Mark completed",
      next: "COMPLETED",
      icon: <Check className="w-4 h-4" />,
    },
    COMPLETED: {
      label: "Event complete",
      next: "",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  };

  const action = primaryAction[status];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 py-4 border border-slate-200 bg-white rounded-2xl px-5 mb-6">
      {/* Steps */}
      <div className="flex-1 flex items-center min-w-0 overflow-x-auto hide-scrollbar">
        {isCancelled ? (
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-bold text-red-600 uppercase tracking-wide">Cancelled</span>
          </div>
        ) : (
          LIFECYCLE_STEPS.map((step, idx) => {
            const isPast = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;
            return (
              <div key={step.key} className="flex items-center min-w-0">
                {/* Step dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                      isPast
                        ? "bg-emerald-500 border-emerald-500"
                        : isCurrent
                        ? "bg-brand border-brand"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span
                        className={`text-[10px] font-bold ${
                          isCurrent ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap hidden sm:block ${
                      isPast
                        ? "text-emerald-600"
                        : isCurrent
                        ? "text-brand"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {/* Connector */}
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-2 min-w-[20px] rounded-full transition-colors ${
                      isPast ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-10 bg-slate-200 mx-5" />

      {/* Primary CTA + overflow menu */}
      <div className="flex items-center gap-2 shrink-0">
        {!isCancelled && action && action.next && (
          <Button
            disabled={loading}
            onClick={() => onTransition(action.next)}
            className="gap-2 bg-brand hover:bg-brand-deep text-white font-semibold px-5"
          >
            {action.icon}
            {action.label}
          </Button>
        )}
        {!isCancelled && action && !action.next && (
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" /> Completed
          </div>
        )}

        {/* Secondary / destructive in overflow menu — only render when there are actions */}
        {(() => {
          const canUnpublish = status === "UPCOMING";
          const canCancel = status !== "CANCELLED" && status !== "COMPLETED";
          const canRestore = status === "CANCELLED";
          const canReopen = status === "COMPLETED";

          if (!canUnpublish && !canCancel && !canRestore && !canReopen) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white w-44">
                {canUnpublish && (
                  <DropdownMenuItem
                    className="text-slate-700"
                    onClick={() => onTransition("DRAFT")}
                  >
                    Unpublish (revert to Draft)
                  </DropdownMenuItem>
                )}
                {canReopen && (
                  <DropdownMenuItem
                    className="text-slate-700"
                    onClick={() => onTransition("ONGOING")}
                  >
                    Reopen (mark Ongoing)
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onTransition("CANCELLED")}
                  >
                    Cancel event
                  </DropdownMenuItem>
                )}
                {canRestore && (
                  <DropdownMenuItem onClick={() => onTransition("DRAFT")}>
                    Restore to Draft
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Stage-Aware Body Sections ────────────────────────────────────────────────

function DraftBody({
  event,
}: {
  event: EventDashboardProps["event"];
}) {
  const hasPoster = !!event.imageUrl;
  const hasVenue = !!event.location;
  const registrationConfigured = event.registrationRequired;

  const checks = [
    { label: "Cover poster uploaded", done: hasPoster },
    { label: "Venue / meeting link added", done: hasVenue },
    { label: "Registration configured", done: registrationConfigured },
    { label: "Description written", done: !!event.description },
  ];
  const readyCount = checks.filter((c) => c.done).length;
  const pct = Math.round((readyCount / checks.length) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <DetailsCard event={event} />
        <SectionToggle title="Gallery & Media" defaultOpen={false}>
          <p className="text-sm text-slate-500 mb-4">
            Upload event posters and photos here to complete readiness.
          </p>
          {event.media.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {event.media.slice(0, 8).map((m) => (
                <div
                  key={m.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-200"
                >
                  <Image src={m.url} alt={m.title || ""} fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          ) : (
            <PortalEmptyState title="No media yet" detail="Use Event Settings to upload poster or photos." />
          )}
        </SectionToggle>
      </div>
      <div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Publish checklist
          </p>
          <div className="mb-4 space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Ready to publish</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand h-full transition-all duration-500 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <ul>
            {checks.map((c) => (
              <ChecklistItem key={c.label} label={c.label} done={c.done} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PublishedBody({
  event,
  onToggleCheckIn,
}: {
  event: EventDashboardProps["event"];
  onToggleCheckIn: (id: string, status: string) => void;
}) {
  const registeredCount = event.registrations.length;
  const capacityPct = event.capacity
    ? Math.min(100, Math.round((registeredCount / event.capacity) * 100))
    : null;

  return (
    <div className="space-y-6">
      <StatGrid className="lg:grid-cols-3">
        <StatCard
          label="Registered"
          value={registeredCount}
          icon={Users}
          tone="neutral"
        />
        <StatCard
          label="Capacity"
          value={event.capacity ?? "Unlimited"}
          icon={Users}
          tone="neutral"
        />
        {capacityPct !== null && (
          <StatCard label="Capacity filled" value={`${capacityPct}%`} icon={Percent} tone="brand" />
        )}
      </StatGrid>

      {/* Registrations table */}
      {event.registrations.length > 0 ? (
        <TableWrap
          mobile={event.registrations.map((reg) => (
            <div key={reg.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{reg.member.name || "Unnamed"}</p>
                  <p className="text-xs text-slate-500 truncate">{reg.member.email || "-"}</p>
                </div>
                <RegistrationStatusBadge status={reg.status} />
              </div>
              <p className="text-xs text-slate-400">
                Registered {new Date(reg.registeredAt).toLocaleDateString()}
              </p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {event.registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{reg.member.name || "Unnamed"}</td>
                  <td className="px-5 py-3.5">{reg.member.email || "-"}</td>
                  <td className="px-5 py-3.5">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <RegistrationStatusBadge status={reg.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <PortalEmptyState title="No registrations yet" detail="Registrations will appear here once members sign up." />
      )}

      <SectionToggle title="Details & Logistics" defaultOpen={false}>
        <DetailsCard event={event} />
      </SectionToggle>
    </div>
  );
}

function OngoingBody({
  event,
  onToggleCheckIn,
}: {
  event: EventDashboardProps["event"];
  onToggleCheckIn: (id: string, status: string) => void;
}) {
  const attendedCount = event.registrations.filter((r) => r.status === "ATTENDED").length;
  const attendanceRatio =
    event.registrations.length > 0
      ? `${Math.round((attendedCount / event.registrations.length) * 100)}%`
      : "0%";

  return (
    <div className="space-y-6">
      {/* Hero CTA — front and center */}
      <div className="rounded-2xl border-2 border-brand/20 bg-pink-50/40 p-6 flex flex-col sm:flex-row items-center gap-5 justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-1">Event is live</p>
          <h3 className="text-xl font-bold text-slate-900">Manage live attendance</h3>
          <p className="text-sm text-slate-500 mt-1">
            Open QR sessions, track real-time check-ins, and manage manual attendance.
          </p>
        </div>
        <Link href={`/admin/events/${event.id}/attendance`}>
          <Button className="bg-brand hover:bg-brand-deep text-white gap-2 font-semibold px-6 py-5 shrink-0">
            <QrCode className="w-5 h-5" />
            Open Attendance Manager
          </Button>
        </Link>
      </div>

      {/* Live stats */}
      <StatGrid className="lg:grid-cols-3">
        <StatCard label="Registered" value={event.registrations.length} icon={Users} tone="neutral" />
        <StatCard label="Checked In" value={attendedCount} icon={CheckCircle} tone="positive" />
        <StatCard label="Attendance Rate" value={attendanceRatio} icon={Percent} tone="brand" />
      </StatGrid>

      {/* Quick checkin table for small events */}
      {event.registrations.length > 0 && (
        <TableWrap
          mobile={event.registrations.map((reg) => (
            <div key={reg.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{reg.member.name || "Unnamed"}</p>
                  <p className="text-xs text-slate-500 truncate">{reg.member.email || "-"}</p>
                </div>
                <RegistrationStatusBadge status={reg.status} />
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant={reg.status === "ATTENDED" ? "outline" : "default"}
                  onClick={() => onToggleCheckIn(reg.id, reg.status)}
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
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Check In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {event.registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{reg.member.name || "Unnamed"}</td>
                  <td className="px-5 py-3.5">{reg.member.email || "-"}</td>
                  <td className="px-5 py-3.5">
                    <RegistrationStatusBadge status={reg.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant={reg.status === "ATTENDED" ? "outline" : "default"}
                      onClick={() => onToggleCheckIn(reg.id, reg.status)}
                      className="text-xs h-8"
                    >
                      {reg.status === "ATTENDED" ? "Undo" : "Check In"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  );
}

function CompletedBody({
  event,
  reportText,
  setReportText,
  onSaveReport,
  loading,
}: {
  event: EventDashboardProps["event"];
  reportText: string;
  setReportText: (v: string) => void;
  onSaveReport: () => void;
  loading: boolean;
}) {
  const attendedCount = event.registrations.filter((r) => r.status === "ATTENDED").length;
  const attendanceRatio =
    event.registrations.length > 0
      ? `${Math.round((attendedCount / event.registrations.length) * 100)}%`
      : "0%";

  const bannerThumb = event.media?.find((m) => m.id === event.bannerMediaId) || event.media?.[0];

  return (
    <div className="space-y-6">
      {/* Impact row */}
      <StatGrid className="lg:grid-cols-3">
        <StatCard label="Attended" value={attendedCount} icon={CheckCircle} tone="positive" />
        <StatCard label="Registered" value={event.registrations.length} icon={Users} tone="neutral" />
        <StatCard label="Attendance Rate" value={attendanceRatio} icon={Percent} tone="brand" />
      </StatGrid>

      {/* Minutes / Report */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-brand" />
          <p className="text-sm font-semibold text-slate-900">Meeting Minutes & Report</p>
        </div>
        <Textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="Draft official minutes or post-event report here..."
          className="min-h-[200px] font-sans text-sm leading-relaxed bg-slate-50"
        />
        <div className="flex justify-end pt-3">
          <Button
            onClick={onSaveReport}
            disabled={loading}
            className="bg-brand hover:bg-brand-deep text-white"
          >
            {loading ? "Saving..." : "Save Minutes"}
          </Button>
        </div>
      </div>

      {/* Media moderation */}
      <SectionToggle title="Photos & Media" defaultOpen={true}>
        {bannerThumb?.url ? (
          <div className="mb-4 relative aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-100">
            <Image src={bannerThumb.url} alt={event.title} fill sizes="384px" className="object-cover" />
          </div>
        ) : (
          <div className="mb-4 p-8 border border-dashed border-slate-200 rounded-xl text-center">
            <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No cover image yet</p>
          </div>
        )}
        <EventMediaModeration
          eventId={event.id}
          media={event.media}
          driveFolderId={event.driveFolderId}
          bannerMediaId={event.bannerMediaId}
          posterMediaId={event.posterMediaId}
        />
      </SectionToggle>

      {/* Finance summary (always present for completed) */}
      <SectionToggle title="Finance Summary" defaultOpen={false}>
        <StatGrid className="lg:grid-cols-2">
          <StatCard
            label="Total Income"
            tone="positive"
            value={`₹ ${event.transactions
              .filter((t) => t.type === "INCOME" && t.status === "APPROVED")
              .reduce((acc, curr) => acc + Number(curr.amount), 0)
              .toLocaleString()}`}
          />
          <StatCard
            label="Total Expenses"
            tone="critical"
            value={`₹ ${event.transactions
              .filter((t) => t.type === "EXPENSE" && t.status === "APPROVED")
              .reduce((acc, curr) => acc + Number(curr.amount), 0)
              .toLocaleString()}`}
          />
        </StatGrid>
        {event.transactions.length > 0 && (
          <div className="mt-4">
            <TableWrap
              mobile={event.transactions.map((t) => (
                <div key={t.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900 truncate">{t.title}</p>
                    <TransactionStatusBadge status={t.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{t.type}</span>
                    <span className="font-semibold text-slate-900">₹ {Number(t.amount).toLocaleString()}</span>
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
                      <td className="px-5 py-3">
                        <TransactionStatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </div>
        )}
      </SectionToggle>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function EventDashboard({ event }: EventDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState(event.minutes?.content || "");

  async function handleTransition(status: string) {
    setLoading(true);
    try {
      const res = await transitionEvent(event.id, status as any);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Event is now ${status.toLowerCase().replace("_", " ")}`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update event status");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleCheckIn(registrationId: string, currentStatus: string) {
    const isAttending = currentStatus === "ATTENDED";
    try {
      const res = await fetch(`/api/admin/events/${event.id}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId: registrationId, attended: !isAttending }),
      });
      if (!res.ok) throw new Error();
      toast.success(isAttending ? "Marked as registered only" : "Checked in successfully");
      router.refresh();
    } catch {
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
        toast.success("Minutes saved!");
        router.refresh();
      }
    } catch {
      toast.error("Failed to save minutes");
    } finally {
      setLoading(false);
    }
  }

  const status = event.status;

  return (
    <div className="space-y-0">
      {/* ── Lifecycle Stepper ─────────────────────────────── */}
      <LifecycleStepper
        status={status}
        onTransition={handleTransition}
        loading={loading}
        eventId={event.id}
      />

      {/* ── Stage-Aware Body ───────────────────────────────── */}
      {(status === "DRAFT" || status === "PLANNING") && (
        <DraftBody event={event} />
      )}
      {(status === "UPCOMING") && (
        <PublishedBody event={event} onToggleCheckIn={handleToggleCheckIn} />
      )}
      {(status === "ONGOING") && (
        <OngoingBody event={event} onToggleCheckIn={handleToggleCheckIn} />
      )}
      {(status === "COMPLETED" || status === "CANCELLED") && (
        <CompletedBody
          event={event}
          reportText={reportText}
          setReportText={setReportText}
          onSaveReport={handleSaveReport}
          loading={loading}
        />
      )}
    </div>
  );
}
