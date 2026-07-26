"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, UserCheck } from "lucide-react";

export default function DashboardProjectsClient({ 
    available, 
    joined, 
    memberId
}: {
    available: any[],
    joined: any[],
    memberId: string
}) {
    const [activeTab, setActiveTab] = useState<"JOINED" | "AVAILABLE">("JOINED");

    const tabs = [
        { id: "JOINED", label: "My Projects", count: joined.length },
        { id: "AVAILABLE", label: "Available Projects", count: available.length },
    ];

    const projects = activeTab === "JOINED" ? joined : available;

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                            activeTab === tab.id 
                            ? "bg-brand text-white shadow-md font-semibold"
                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 font-medium"
                        }`}
                    >
                        {tab.label}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20" : "bg-slate-200"}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Project List */}
            {projects.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
                    <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
                    <p className="text-slate-500">There are no projects in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: any) => {
                      const coverUrl = project.media?.[0]?.url;
                      return (
                        <Card key={project.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                            {coverUrl ? (
                                <div className="h-32 w-full bg-slate-200 relative">
                                    <Image src={coverUrl} alt={project.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                                </div>
                            ) : (
                                <div className="h-24 w-full bg-gradient-to-r from-emerald-100 to-teal-100"></div>
                            )}
                            <CardContent className="p-5 flex-1 flex flex-col">
                                <Badge variant="secondary" className="w-fit mb-3 bg-slate-100 text-slate-600 border-0">{project.category || "General"}</Badge>
                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{project.title}</h3>
                                
                                <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">
                                    {project.description}
                                </p>

                                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4 shrink-0" /> {project.memberships?.length || 0} members</span>
                                </div>

                                {activeTab === "AVAILABLE" && (
                                    <Button className="w-full" variant="outline">
                                        View Details
                                    </Button>
                                )}
                                {activeTab === "JOINED" && (
                                    <div className="bg-pink-50 text-brand px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-pink-100 capitalize">
                                        <UserCheck className="w-4 h-4" /> Role: {project.myRole?.toLowerCase()}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                      );
                    })}
                </div>
            )}
        </div>
    );
}
