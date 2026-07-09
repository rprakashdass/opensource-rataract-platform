"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MemberListView({ members }: { members: any[] }) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Designation</th>
              <th className="px-6 py-4">System Access</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members?.map((member) => {
              const currentBoard = member.boardMemberships?.[0];
              return (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                        {member.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                      {currentBoard?.position || "Member"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {member.user?.roles?.map((role: string) => (
                        <span key={role} className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {role.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/members/${member.id}`}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        View Profile
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col divide-y divide-slate-100">
        {members?.map((member) => {
          const currentBoard = member.boardMemberships?.[0];
          return (
            <div key={member.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0 text-lg">
                    {member.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                  {currentBoard?.position || "Member"}
                </span>
                {member.user?.roles?.map((role: string) => (
                  <span key={role} className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {role.replace("_", " ")}
                  </span>
                ))}
              </div>
              <div className="pt-2">
                <Link href={`/admin/members/${member.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
