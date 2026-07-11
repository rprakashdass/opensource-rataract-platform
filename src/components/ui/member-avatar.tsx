import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-gradient-to-br from-slate-100 to-slate-250 text-[#0B132B] border border-slate-200/60 shadow-inner",
  "bg-gradient-to-br from-stone-100 to-stone-250 text-[#0B132B] border border-stone-200/60 shadow-inner",
  "bg-gradient-to-br from-zinc-100 to-zinc-250 text-[#0B132B] border border-zinc-200/60 shadow-inner",
  "bg-gradient-to-br from-neutral-100 to-neutral-250 text-[#0B132B] border border-neutral-200/60 shadow-inner",
];

function getInitials(name?: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name?: string | null): string {
  if (!name) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface MemberAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  /** Sizing/border/shadow classes, e.g. "w-14 h-14 border-2 border-white". Ignored for outer positioning when fill is set, but still applied for extra styling. */
  className?: string;
  /** Absolutely fill the (relatively-positioned, sized) parent instead of self-sizing — mirrors next/image's `fill` prop. */
  fill?: boolean;
  /** Tailwind text-size class for the initials fallback, e.g. "text-2xl". */
  textClassName?: string;
}

export function MemberAvatar({ name, avatarUrl, className, fill = false, textClassName = "text-sm" }: MemberAvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn("rounded-full overflow-hidden shrink-0", fill && "absolute inset-0", !fill && !className && "w-10 h-10", className)}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name || "Member"} className="w-full h-full object-cover" />
      ) : initials ? (
        <div className={cn("w-full h-full flex items-center justify-center font-black", getColor(name), textClassName)}>
          {initials}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
          <User className="w-1/2 h-1/2" />
        </div>
      )}
    </div>
  );
}
