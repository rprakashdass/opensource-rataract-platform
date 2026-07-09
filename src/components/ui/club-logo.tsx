import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

function getClubInitials(name?: string | null): string {
  if (!name) return "";
  const words = name.replace(/rotaract|club|of/gi, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface ClubLogoProps {
  logoUrl?: string | null;
  name?: string | null;
  /** Size in pixels (square). */
  size?: number;
  className?: string;
}

export function ClubLogo({ logoUrl, name, size = 40, className }: ClubLogoProps) {
  const initials = getClubInitials(name);

  return (
    <div
      className={cn("rounded-full overflow-hidden shrink-0 bg-white flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={name ? `${name} logo` : "Club logo"} className="w-full h-full object-contain" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 text-white font-black"
          style={{ fontSize: size * 0.32 }}
        >
          {initials || <Users style={{ width: size * 0.45, height: size * 0.45 }} />}
        </div>
      )}
    </div>
  );
}
