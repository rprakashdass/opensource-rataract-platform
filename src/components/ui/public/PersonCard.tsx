import React from "react";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/ui/member-avatar";

interface PersonCardProps {
  name: string;
  avatarUrl?: string;
  professionOrYear?: string;
  boardRole?: string;
  portfolio?: string;
  joinedAt?: string | Date;
  size?: "lg" | "md";
}

export function PersonCard({ 
  name, 
  avatarUrl, 
  professionOrYear, 
  boardRole,
  portfolio,
  joinedAt,
  size = "md"
}: PersonCardProps) {
  const isLarge = size === "lg";
  
  // Format joined year
  let joinedYear = "";
  if (joinedAt) {
    try {
      joinedYear = `Since ${new Date(joinedAt).getFullYear()}`;
    } catch (e) {
      joinedYear = "";
    }
  }

  return (
    <div className="flex flex-col items-center text-center group bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full max-w-[240px] mx-auto min-h-[220px] justify-between">
      <div className="space-y-4 w-full flex flex-col items-center">
        {/* Avatar */}
        <div className={`
          rounded-full overflow-hidden border-2 border-slate-100 shadow-sm relative transition-transform duration-350 group-hover:scale-[1.03] shrink-0
          ${isLarge ? "w-24 h-24 md:w-28 h-28" : "w-20 h-20"}
        `}>
          <MemberAvatar
            name={name}
            avatarUrl={avatarUrl}
            fill
            textClassName={isLarge ? "text-2xl md:text-3xl" : "text-xl"}
            className="object-cover"
          />
        </div>
        
        {/* Text details */}
        <div className="space-y-1 w-full">
          <h3 className="font-black text-[#0B132B] leading-tight text-sm md:text-base group-hover:text-secondary transition-colors line-clamp-1">
            {name}
          </h3>
          
          {professionOrYear && (
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider line-clamp-1">
              {professionOrYear}
            </p>
          )}

          {portfolio && (
            <p className="text-[10px] text-secondary font-black uppercase tracking-widest line-clamp-1">
              {portfolio}
            </p>
          )}
        </div>
      </div>

      {/* Badges / Meta row */}
      <div className="w-full pt-3 mt-3 border-t border-slate-100 flex flex-col items-center gap-1.5 shrink-0">
        {boardRole && (
          <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-wider hover:bg-primary/15 select-none">
            {boardRole.replace(/_/g, " ").replace(/-/g, " ")}
          </Badge>
        )}
        {joinedYear && (
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest select-none">
            {joinedYear}
          </span>
        )}
      </div>
    </div>
  );
}
