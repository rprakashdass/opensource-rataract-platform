import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Calendar, Banknote, UserCircle, AlertCircle, ArrowRight, Activity, Wallet } from "lucide-react";
import Link from "next/link";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import PendingRequests from "./finance/_components/PendingRequests";

import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch Member Details
  const member = await prisma.member.findUnique({
    where: { userId: session.id },
    include: {
      registrations: {
        include: { event: true },
        orderBy: { registeredAt: "desc" }
      },
      attendance: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 3
      }
    }
  });

  const club = await getOrCreateDefaultClub();

  let pendingRequests: any[] = [];
  if (member) {
    const allRequests = await prisma.paymentRequest.findMany({
      where: {
        clubId: club.id,
        OR: [
          { isGlobal: true },
          { assignees: { some: { memberId: member.id } } }
        ]
      },
      include: {
        transactions: {
          where: { userId: session.id }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    pendingRequests = allRequests.filter(req => 
      !req.dismissedBy.includes(member.id) &&
      !req.transactions.some((t: any) => t.status === "APPROVED" || t.status === "COMPLETED")
    );
  }

  const eventsAttended = member?.attendance?.length || 0;
  
  const totalPaid = member?.transactions
    ?.filter(t => t.type === "INCOME" && (t.status === "COMPLETED" || t.status === "APPROVED"))
    .reduce((acc: number, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Hello, {session.name} 👋
        </h1>
        <p className="text-base text-gray-500 max-w-2xl">
          Welcome to your member portal. Here is a quick overview of your activity.
        </p>
      </div>

      {!member && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8 text-center shadow-sm">
          <UserCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Your Member Profile</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">You need to set up your profile before you can register for events or track your payments.</p>
          <Link href="/dashboard/profile" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl transition inline-flex items-center gap-2">
            Create Profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {member && pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-6 w-6" />
              <h2 className="font-bold text-lg">Action Required: Pending Payments</h2>
            </div>
            <Link href="/dashboard/finance" className="text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <PendingRequests requests={pendingRequests.slice(0, 2)} />
        </div>
      )}

      {member && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 p-6 flex flex-col justify-between group hover:border-purple-200 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-purple-700">
                  <Calendar className="h-6 w-6" />
                  <h3 className="font-semibold text-gray-700">Events Attended</h3>
                </div>
                <Activity className="h-4 w-4 text-gray-300 group-hover:text-purple-300 transition" />
              </div>
              <p className="text-4xl font-black text-gray-900">{eventsAttended}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 p-6 flex flex-col justify-between group hover:border-emerald-200 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-emerald-600">
                  <Banknote className="h-6 w-6" />
                  <h3 className="font-semibold text-gray-700">Contributions</h3>
                </div>
                <Wallet className="h-4 w-4 text-gray-300 group-hover:text-emerald-300 transition" />
              </div>
              <p className="text-4xl font-black text-gray-900">₹{totalPaid.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <UserCircle className="h-24 w-24" />
            </div>
            <div className="bg-white/10 p-3 rounded-full mb-3 text-white backdrop-blur-sm z-10">
              <UserCircle className="h-8 w-8" />
            </div>
            <p className="font-medium text-white mb-4 z-10">Profile Status</p>
            <Link href="/dashboard/profile" className="w-full bg-white text-gray-900 font-bold py-2 px-4 rounded-xl text-sm hover:bg-gray-100 transition z-10">
              Update Info
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 font-semibold text-gray-900">
            Recent Registrations
          </div>
          <div className="p-0">
            {member?.registrations.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">You haven't registered for any events yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {member?.registrations.slice(0, 3).map((reg: any) => (
                  <li key={reg.id} className="p-4 hover:bg-gray-50 transition">
                    <p className="text-sm font-medium text-gray-900">{reg.event.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 font-semibold text-gray-900">
            Recent Payments
          </div>
          <div className="p-0">
            {member?.transactions.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No payment history.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {member?.transactions.map((tx: any) => (
                  <li key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full
                      ${tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                        tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {tx.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
