"use client";

import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";

interface MemberAvatarProps {
  member: TeamMember;
  size?: "sm" | "md";
  className?: string;
}

export function MemberAvatar({ member, size = "sm", className }: MemberAvatarProps) {
  const initial = member.name.charAt(0).toUpperCase();
  return (
    <div
      title={member.name}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ring-2 ring-background",
        size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]",
        className
      )}
      style={{ backgroundColor: member.color }}
    >
      {initial}
    </div>
  );
}

interface AvatarGroupProps {
  members: TeamMember[];
  max?: number;
  size?: "sm" | "md";
}

export function AvatarGroup({ members, max = 3, size = "sm" }: AvatarGroupProps) {
  if (members.length === 0) return null;

  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((m) => (
        <MemberAvatar key={m.id} member={m} size={size} />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background",
            size === "sm" ? "h-5 w-5 text-[8px]" : "h-6 w-6 text-[9px]"
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
