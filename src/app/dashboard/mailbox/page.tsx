import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { getMemberCommunications } from "@/features/communications/queries/getMemberCommunications";
import Link from "next/link";
import { MailboxStatus, MailboxType, MailboxPriority } from "@prisma/client";
import { PenLine, Inbox, Clock, AlertCircle, CheckCircle2, XCircle, ChevronRight, Paperclip } from "lucide-react";

export const metadata = { title: "My Mailbox | Dashboard" };

const TYPE_META: Record<string, { label: string; emoji: string; pill: string }> = {
  EXCUSE:    { label: "Absence Excuse",       emoji: "🙏", pill: "bg-wash text-ink-soft ring-1 ring-hairline" },
  COMPLAINT: { label: "Complaint",            emoji: "🚩", pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
  INQUIRY:   { label: "Inquiry",              emoji: "💬", pill: "bg-wash text-ink ring-1 ring-hairline" },
  OTHER:     { label: "Other",                emoji: "📝", pill: "bg-wash text-ink-soft ring-1 ring-hairline" },
};

const STATUS_META: Record<string, { label: string; pill: string; icon: React.ReactNode }> = {
  OPEN:        { label: "Open",        pill: "bg-wash text-ink ring-1 ring-hairline",    icon: <Clock className="w-3 h-3" /> },
  IN_PROGRESS: { label: "In Progress", pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", icon: <AlertCircle className="w-3 h-3" /> },
  RESOLVED:    { label: "Resolved",    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  CLOSED:      { label: "Closed",      pill: "bg-wash text-ink-faint ring-1 ring-hairline", icon: <XCircle className="w-3 h-3" /> },
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH:   "bg-rose-500",
  MEDIUM: "bg-amber-400",
  LOW:    "bg-ink-faint",
};

const TYPE_FILTERS = [
  { label: "All",       value: "" },
  { label: "🙏 Excuse",    value: "EXCUSE" },
  { label: "🚩 Complaint", value: "COMPLAINT" },
  { label: "💬 Inquiry",   value: "INQUIRY" },
  { label: "📝 Other",     value: "OTHER" },
];

export default async function MemberMailboxPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (!session.member?.id) redirect("/dashboard");

  const searchParams = await props.searchParams;
  const typeFilter = searchParams.type || searchParams.status || "";

  const messages = await getMemberCommunications(session.member.id, {
    type: typeFilter || undefined,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Mailbox</h1>
          <p className="text-sm text-ink-soft mt-0.5">
            Messages you've sent to the board
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/mailbox/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-deep text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">New Message</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => {
          const isActive = typeFilter === f.value;
          const href = f.value
            ? `/dashboard/mailbox?type=${f.value}`
            : "/dashboard/mailbox";
          return (
            <Link
              key={f.value}
              href={href}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                isActive
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-paper text-ink-soft border-hairline hover:border-ink-faint hover:bg-wash"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Message list */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-paper rounded-2xl border border-hairline gap-4">
          <div className="w-14 h-14 rounded-2xl bg-wash border border-hairline flex items-center justify-center">
            <Inbox className="w-7 h-7 text-ink-faint" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-ink">
              {typeFilter ? "No messages in this category" : "Nothing here yet"}
            </p>
            <p className="text-sm text-ink-soft mt-1">
              {typeFilter
                ? "Try selecting a different filter above."
                : "Send your first message to the board."}
            </p>
          </div>
          <Link
            href="/dashboard/mailbox/new"
            className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand text-sm font-semibold rounded-lg transition-colors"
          >
            <PenLine className="w-4 h-4" />
            Write a message
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => {
            const tm = TYPE_META[msg.type] ?? TYPE_META.OTHER;
            const sm = STATUS_META[msg.status] ?? STATUS_META.OPEN;
            const dot = PRIORITY_DOT[msg.priority] ?? PRIORITY_DOT.LOW;

            return (
              <div
                key={msg.id}
                className="bg-paper rounded-2xl border border-hairline hover:border-ink-faint hover:shadow-sm transition-all p-4 sm:p-5 flex items-start gap-4 group"
              >
                {/* Emoji icon */}
                <div className="w-10 h-10 rounded-xl bg-wash border border-hairline flex items-center justify-center flex-shrink-0 text-lg">
                  {tm.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{msg.subject}</p>
                    <span
                      className="text-[10px] text-ink-faint whitespace-nowrap mt-0.5 tabular-nums"
                      suppressHydrationWarning
                    >
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-xs text-ink-soft mt-1 line-clamp-2 leading-relaxed">
                    {msg.description}
                  </p>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {/* Type */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tm.pill}`}>
                      {tm.label}
                    </span>

                    {/* Status */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${sm.pill}`}>
                      {sm.icon}
                      {sm.label}
                    </span>

                    {/* Priority dot */}
                    <span className="flex items-center gap-1 text-[11px] text-ink-faint font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {msg.priority.charAt(0) + msg.priority.slice(1).toLowerCase()}
                    </span>

                    {/* Attachment Link */}
                    {msg.attachmentUrl && (
                      <a 
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-wash text-ink-soft hover:bg-parchment transition-colors"
                      >
                        <Paperclip className="w-3 h-3" />
                        Attachment
                      </a>
                    )}
                  </div>

                  {/* Admin note if resolved */}
                  {msg.adminNotes && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Board Reply</p>
                      <p className="text-xs text-emerald-800 leading-relaxed">{msg.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
