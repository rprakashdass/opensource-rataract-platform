import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface PersonCardProps {
  name: string;
  avatarUrl?: string;
  professionOrYear?: string;
  boardRole?: string;
}

export function PersonCard({ name, avatarUrl, professionOrYear, boardRole }: PersonCardProps) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 relative">
        <Image 
          src={avatarUrl || "/user.png"} 
          alt={name} 
          fill
          sizes="(max-width: 768px) 96px, 128px"
          className="object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
      <h3 className="text-lg font-bold text-slate-900 leading-tight">{name}</h3>
      {professionOrYear && (
        <p className="text-sm text-slate-500 mt-1">{professionOrYear}</p>
      )}
      {boardRole && (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 mt-2 border-none text-xs uppercase tracking-wider">
          {boardRole.replace(/_/g, " ")}
        </Badge>
      )}
    </div>
  );
}
