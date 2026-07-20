"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MailboxStatus, MailboxPriority, MailboxType } from "@prisma/client";
import { 
  Inbox, Search, Filter, Mail, Paperclip, MessageSquarePlus, 
  Clock, AlertCircle, CheckCircle2, XCircle, Eye, ShieldAlert, User
} from "lucide-react";
import { updateCommunicationStatus } from "@/features/communications/actions/communicationActions";
import { updateComplaintStatus, ComplaintStatus } from "@/features/complaints/actions/updateComplaintStatus";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MEMBER_STATUS_META: Record<string, { label: string; pill: string; icon: React.ReactNode }> = {
  OPEN:        { label: "Open",        pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",    icon: <Clock className="w-3 h-3" /> },
  IN_PROGRESS: { label: "In Progress", pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", icon: <AlertCircle className="w-3 h-3" /> },
  RESOLVED:    { label: "Resolved",    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  CLOSED:      { label: "Closed",      pill: "bg-slate-100 text-slate-500 ring-1 ring-slate-200", icon: <XCircle className="w-3 h-3" /> },
};

const COMPLAINT_STATUS_META: Record<string, { label: string; pill: string; icon: React.ReactNode }> = {
  OPEN:      { label: "Open",      pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",       icon: <Clock className="w-3 h-3" /> },
  REVIEWING: { label: "Reviewing", pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",   icon: <AlertCircle className="w-3 h-3" /> },
  RESOLVED:  { label: "Resolved",  pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  DISMISSED: { label: "Dismissed", pill: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",   icon: <XCircle className="w-3 h-3" /> },
};

const PRIORITY_META: Record<string, { label: string; dot: string }> = {
  HIGH:   { label: "High",   dot: "bg-rose-500" },
  MEDIUM: { label: "Medium", dot: "bg-amber-400" },
  LOW:    { label: "Low",    dot: "bg-slate-300" },
};

const TYPE_META: Record<string, { label: string; emoji: string; pill: string }> = {
  EXCUSE:    { label: "Absence Excuse", emoji: "🙏", pill: "bg-violet-50 text-violet-700 ring-1 ring-violet-200" },
  COMPLAINT: { label: "Complaint",      emoji: "🚩", pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
  INQUIRY:   { label: "Inquiry",        emoji: "💬", pill: "bg-sky-50 text-sky-700 ring-1 ring-sky-200" },
  OTHER:     { label: "Other",          emoji: "📝", pill: "bg-slate-100 text-slate-600 ring-1 ring-slate-200" },
};

interface AdminInboxClientProps {
  memberCommunications: any[];
  anonymousComplaints: any[];
}

export default function AdminInboxClient({ memberCommunications, anonymousComplaints }: AdminInboxClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"members" | "complaints">("members");

  // Filter States - Member Messages
  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>("ALL");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>("ALL");
  const [memberPriorityFilter, setMemberPriorityFilter] = useState<string>("ALL");

  // Filter States - Complaints
  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<string>("ALL");
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState<string>("ALL");

  // Modal State
  const [selectedItem, setSelectedItem] = useState<{ type: "member" | "complaint"; data: any } | null>(null);
  const [modalStatus, setModalStatus] = useState<string>("OPEN");
  const [modalNotes, setModalNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter Member Communications
  const filteredMemberComms = memberCommunications.filter((item) => {
    if (memberStatusFilter !== "ALL" && item.status !== memberStatusFilter) return false;
    if (memberTypeFilter !== "ALL" && item.type !== memberTypeFilter) return false;
    if (memberPriorityFilter !== "ALL" && item.priority !== memberPriorityFilter) return false;
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      const matchSubject = item.subject?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchMember = item.member?.name?.toLowerCase().includes(q) || item.member?.email?.toLowerCase().includes(q);
      if (!matchSubject && !matchDesc && !matchMember) return false;
    }
    return true;
  });

  // Filter Anonymous Complaints
  const filteredComplaints = anonymousComplaints.filter((item) => {
    if (complaintStatusFilter !== "ALL" && item.status !== complaintStatusFilter) return false;
    if (complaintCategoryFilter !== "ALL" && item.category !== complaintCategoryFilter) return false;
    if (complaintSearch.trim()) {
      const q = complaintSearch.toLowerCase();
      const matchMessage = item.message?.toLowerCase().includes(q);
      if (!matchMessage) return false;
    }
    return true;
  });

  const openUpdateModal = (type: "member" | "complaint", data: any) => {
    setSelectedItem({ type, data });
    setModalStatus(data.status);
    setModalNotes(type === "member" ? data.adminNotes || "" : data.adminNote || "");
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsUpdating(true);
    if (selectedItem.type === "member") {
      const res = await updateCommunicationStatus({
        id: selectedItem.data.id,
        status: modalStatus as MailboxStatus,
        adminNotes: modalNotes,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Member message status updated!");
        setSelectedItem(null);
        router.refresh();
      }
    } else {
      const res = await updateComplaintStatus(
        selectedItem.data.id,
        modalStatus as ComplaintStatus,
        modalNotes
      );
      if (res.error) toast.error(res.error);
      else {
        toast.success("Anonymous complaint status updated!");
        setSelectedItem(null);
        router.refresh();
      }
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Inbox className="w-6 h-6 text-brand" />
          Inbox
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Centralized management for member communications and anonymous complaints.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab("members")}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
              activeTab === "members"
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Member Messages</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === "members" ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-600"
            }`}>
              {memberCommunications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("complaints")}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
              activeTab === "complaints"
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Anonymous Complaints</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === "complaints" ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-600"
            }`}>
              {anonymousComplaints.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Member Messages */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search subject or member..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={memberStatusFilter}
                onChange={(e) => setMemberStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>

              <select
                value={memberTypeFilter}
                onChange={(e) => setMemberTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="EXCUSE">Absence Excuse</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="INQUIRY">Inquiry</option>
                <option value="OTHER">Other</option>
              </select>

              <select
                value={memberPriorityFilter}
                onChange={(e) => setMemberPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredMemberComms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800">No member communications yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Messages sent by authenticated club members will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Subject & Details</th>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredMemberComms.map((msg) => {
                      const tm = TYPE_META[msg.type] ?? TYPE_META.OTHER;
                      const sm = MEMBER_STATUS_META[msg.status] ?? MEMBER_STATUS_META.OPEN;
                      const pm = PRIORITY_META[msg.priority] ?? PRIORITY_META.LOW;

                      return (
                        <tr key={msg.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-semibold text-slate-900 truncate">{msg.subject}</p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{msg.description}</p>
                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline mt-1"
                              >
                                <Paperclip className="w-3 h-3" /> View Attachment
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {msg.member?.avatar ? (
                                <img src={msg.member.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                  {msg.member?.name ? msg.member.name.charAt(0) : <User className="w-3.5 h-3.5" />}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-medium text-slate-800">{msg.member?.name || "Member"}</p>
                                <p className="text-[11px] text-slate-400">{msg.member?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tm.pill}`}>
                              {tm.emoji} {tm.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <span className={`w-2 h-2 rounded-full ${pm.dot}`} />
                              {pm.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sm.pill}`}>
                              {sm.icon} {sm.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                            {format(new Date(msg.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => openUpdateModal("member", msg)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Anonymous Complaints */}
      {activeTab === "complaints" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                placeholder="Search complaint details..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={complaintStatusFilter}
                onChange={(e) => setComplaintStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="REVIEWING">Reviewing</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
              </select>

              <select
                value={complaintCategoryFilter}
                onChange={(e) => setComplaintCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="GENERAL">General</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="FINANCE">Finance</option>
                <option value="GOVERNANCE">Governance</option>
                <option value="EVENT">Event</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800">No anonymous complaints submitted</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Submissions from the public/anonymous complaint box will be listed here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Message Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredComplaints.map((item) => {
                      const sm = COMPLAINT_STATUS_META[item.status] ?? COMPLAINT_STATUS_META.OPEN;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 max-w-md">
                            <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.message}</p>
                            {item.adminNote && (
                              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-1 mt-1.5">
                                <strong>Note:</strong> {item.adminNote}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-200">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sm.pill}`}>
                              {sm.icon} {sm.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                            {format(new Date(item.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => openUpdateModal("complaint", item)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedItem && (
            <form onSubmit={handleUpdateStatus}>
              <DialogHeader>
                <DialogTitle>
                  Manage {selectedItem.type === "member" ? "Member Message" : "Anonymous Complaint"}
                </DialogTitle>
                <DialogDescription>
                  Update the status and record internal resolution notes.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {/* Details preview */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                  {selectedItem.type === "member" ? (
                    <>
                      <p className="font-semibold text-slate-900">{selectedItem.data.subject}</p>
                      <p className="text-slate-600 line-clamp-3">{selectedItem.data.description}</p>
                      {selectedItem.data.attachmentUrl && (
                        <a href={selectedItem.data.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand font-semibold hover:underline mt-1">
                          <Paperclip className="w-3 h-3" /> View Attachment
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-purple-800">Category: {selectedItem.data.category}</p>
                      <p className="text-slate-700 leading-relaxed">{selectedItem.data.message}</p>
                    </>
                  )}
                </div>

                {/* Status select */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select value={modalStatus} onValueChange={setModalStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedItem.type === "member" ? (
                        <>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="REVIEWING">Reviewing</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="DISMISSED">Dismissed</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Resolution Notes</Label>
                  <Textarea
                    placeholder="Enter notes about how this was addressed..."
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    rows={4}
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-brand hover:bg-brand-deep disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
