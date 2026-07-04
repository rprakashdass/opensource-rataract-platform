import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MembersAdmin() {
  const members = await prisma.member.findMany({
    include: {
      boardMembership: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-700">Members</span>
          <h1 className="text-3xl font-bold text-gray-900">Members overview</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Keep the member list readable here and use the creation page when you add or update profile data.
          </p>
        </div>
        <Link href="/admin/members/new" className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition">
          Add Member
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Registered members</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{members.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Board members</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{members.filter((member) => member.boardMembership).length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Creation flow</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">Separate page</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Created members</h2>
            <p className="text-sm text-gray-500">All profiles are shown here without the form crowding the page.</p>
          </div>
          <Link href="/admin/members/new" className="text-sm font-medium text-purple-700 hover:underline">
            Add new
          </Link>
        </div>

        {members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No members have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{member.name || "No Name"}</div>
                      <div className="text-xs text-gray-500 mt-1">{member.profession || "Member"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{member.email || "N/A"}</div>
                      <div className="text-xs text-gray-400 mt-1">{member.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.boardMembership ? (
                        <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-purple-100 text-purple-800 uppercase">
                          {member.boardMembership.position}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-gray-100 text-gray-700 uppercase">
                          Member
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
