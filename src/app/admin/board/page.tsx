import { getBoardHistory } from "@/features/members/queries/getBoard";
import Link from "next/link";
import { Shield, Clock, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BoardManagementPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { financialYears, currentYear, board, error } = await getBoardHistory(searchParams.year);

  if (error) {
    return <div className="p-8 text-rose-600 font-bold">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            Board Management
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage board positions across different Rotary years</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" /> Manage Roles
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <Plus className="w-4 h-4" /> Assign Position
            </Button>
        </div>
      </div>

      {/* Year Selection */}
      {financialYears && financialYears.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {financialYears.map(fy => (
                <Link key={fy.id} href={`/admin/board?year=${fy.id}`}>
                    <Badge 
                        variant={currentYear?.id === fy.id ? "default" : "outline"} 
                        className={`px-4 py-1.5 cursor-pointer text-xs ${currentYear?.id === fy.id ? "bg-slate-900 text-white" : ""}`}
                    >
                        {fy.name}
                        {fy.status === "ACTIVE" && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>}
                    </Badge>
                </Link>
            ))}
        </div>
      )}

      {!currentYear ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Financial Years</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-4">Please create a financial year first to manage board history.</p>
            <Link href="/admin/settings">
                <Button variant="outline">Go to Settings</Button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {board && board.length > 0 ? (
                board.map(bm => (
                    <Card key={bm.id} className="border-l-4 border-l-purple-600 shadow-sm relative overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">{bm.position}</p>
                                    <h3 className="font-bold text-lg text-slate-900 mt-1">{bm.member.name}</h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                    {bm.member.name?.[0] || "?"}
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Tenure</p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {new Date(bm.joinedAt).toLocaleDateString()} - {bm.leftAt ? new Date(bm.leftAt).toLocaleDateString() : "Present"}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mb-2 h-8 text-xs">
                                    Edit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                    <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No board members assigned for {currentYear.name}.</p>
                    <Button variant="link" className="text-purple-600 mt-2">Assign First Member</Button>
                </div>
            )}
        </div>
      )}

    </div>
  );
}
