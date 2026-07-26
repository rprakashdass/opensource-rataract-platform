import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/auth/session";
import PrintButton from "./PrintButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EventReportPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ source?: string }>
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const { source } = await searchParams;
  const backHref = source === "member" ? `/member/events/${id}` : `/admin/events/${id}`;
  
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      club: true,
      project: true,
      minutes: true,
      registrations: {
        where: { status: "ATTENDED" },
        include: {
          member: { select: { name: true, email: true } }
        },
        orderBy: { registeredAt: "asc" }
      },
      transactions: {
        where: { status: "APPROVED" },
      }
    }
  });

  if (!event) notFound();

  const currentUser = await prisma.member.findUnique({ where: { userId: session.id } });
  const preparedBy = currentUser?.name || "Admin";

  const income = event.transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + Number(t.amount), 0);
  const expense = event.transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white p-4 sm:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Floating Print Toolbar (hidden on print) */}
        <div className="print:hidden flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <Link href={backHref} className="flex items-center text-sm font-semibold text-slate-500 hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Event
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-slate-400">Set margins to "None" for best results</p>
            <PrintButton />
          </div>
        </div>

        {/* A4 Report Page */}
        <div className="bg-white print:shadow-none shadow-xl border border-slate-200 print:border-none p-8 sm:p-12 min-h-[1056px] mx-auto print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div className="flex items-center gap-4">
              {event.club.logoUrl ? (
                <div className="w-16 h-16 relative">
                  <Image src={event.club.logoUrl} alt={event.club.name} fill className="object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                  {event.club.name.substring(0, 2)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{event.club.name}</h1>
                <p className="text-slate-500">Official Event Report</p>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Prepared by: {preparedBy}</p>
            </div>
          </div>

          {/* Event Details */}
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{event.title}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <span className="font-semibold text-slate-500 block">Date & Time</span>
                <span className="text-slate-900">{new Date(event.startTime).toLocaleString()} {event.endTime ? `- ${new Date(event.endTime).toLocaleString()}` : ""}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Venue</span>
                <span className="text-slate-900">{event.location || "TBA"}</span>
              </div>
              {event.project && (
                <div>
                  <span className="font-semibold text-slate-500 block">Project / Initiative</span>
                  <span className="text-slate-900">{event.project.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Minutes / Report Body */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Meeting Minutes & Report</h3>
            {event.minutes?.content ? (
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
                {event.minutes.content}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm">No minutes drafted for this event.</p>
            )}
          </div>

          {/* Finance Summary */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Financial Summary</h3>
            <div className="flex gap-12">
              <div>
                <span className="text-sm font-semibold text-slate-500 block">Total Income</span>
                <span className="text-xl font-bold text-emerald-600">₹{income.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-500 block">Total Expense</span>
                <span className="text-xl font-bold text-red-600">₹{expense.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Attendees Appendix */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              Attendance ({event.registrations.length})
            </h3>
            {event.registrations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm text-slate-700">
                {event.registrations.map((reg, idx) => (
                  <div key={reg.id} className="truncate">
                    {idx + 1}. {reg.member?.name || "Unnamed"}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm">No recorded attendance.</p>
            )}
          </div>

          {/* Signatures */}
          <div className="mt-20 pt-8 grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-t border-slate-400 w-48 mx-auto mb-2"></div>
              <p className="font-semibold text-slate-900">Secretary</p>
              <p className="text-xs text-slate-500">{event.club.name}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 w-48 mx-auto mb-2"></div>
              <p className="font-semibold text-slate-900">President</p>
              <p className="text-xs text-slate-500">{event.club.name}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
