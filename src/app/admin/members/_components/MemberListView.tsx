"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMember } from "@/features/members/actions/deleteMember";

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MemberListView({ members }: { members: any[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    setIsDeleting(id);
    const res = await deleteMember(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Member deleted");
    }
    setIsDeleting(null);
  };
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
                      <div className="w-10 h-10 rounded-full bg-pink-50 text-brand flex items-center justify-center font-bold shrink-0 text-sm tracking-wide overflow-hidden relative">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(member.name)
                        )}
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
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/members/${member.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/members/${member.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-brand" title="Edit Member">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50" 
                        title="Delete Member"
                        onClick={() => handleDelete(member.id, member.name)}
                        disabled={isDeleting === member.id}
                      >
                        {isDeleting === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
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
                  <div className="w-12 h-12 rounded-full bg-pink-50 text-brand flex items-center justify-center font-bold shrink-0 text-base tracking-wide overflow-hidden relative">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(member.name)
                    )}
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
              <div className="pt-3 flex gap-2">
                <Link href={`/admin/members/${member.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View
                  </Button>
                </Link>
                <Link href={`/admin/members/${member.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 shrink-0 px-3"
                  onClick={() => handleDelete(member.id, member.name)}
                  disabled={isDeleting === member.id}
                  title="Delete Member"
                >
                  {isDeleting === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
