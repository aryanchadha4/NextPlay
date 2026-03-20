"use client";

import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority, Label, TeamMember } from "@/lib/types";
import { PRIORITY_CONFIG } from "@/lib/types";

interface FilterBarProps {
  priorityFilter: Priority | null;
  labelFilter: string | null;
  assigneeFilter: string | null;
  labels: Label[];
  members: TeamMember[];
  onPriorityChange: (p: Priority | null) => void;
  onLabelChange: (labelId: string | null) => void;
  onAssigneeChange: (memberId: string | null) => void;
}

export function FilterBar({
  priorityFilter,
  labelFilter,
  assigneeFilter,
  labels,
  members,
  onPriorityChange,
  onLabelChange,
  onAssigneeChange,
}: FilterBarProps) {
  const hasFilters = priorityFilter || labelFilter || assigneeFilter;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span>Filter:</span>
      </div>

      {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
        <button
          key={p}
          onClick={() =>
            onPriorityChange(priorityFilter === p ? null : p)
          }
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border",
            priorityFilter === p
              ? "border-foreground/20 bg-foreground/5"
              : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_CONFIG[p].dot)} />
          {PRIORITY_CONFIG[p].label}
        </button>
      ))}

      {labels.length > 0 && (
        <>
          <div className="h-4 w-px bg-border" />
          {labels.map((label) => (
            <button
              key={label.id}
              onClick={() =>
                onLabelChange(labelFilter === label.id ? null : label.id)
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border",
                labelFilter === label.id
                  ? "border-foreground/20 bg-foreground/5"
                  : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
            </button>
          ))}
        </>
      )}

      {members.length > 0 && (
        <>
          <div className="h-4 w-px bg-border" />
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() =>
                onAssigneeChange(assigneeFilter === member.id ? null : member.id)
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border",
                assigneeFilter === member.id
                  ? "border-foreground/20 bg-foreground/5"
                  : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              {member.name}
            </button>
          ))}
        </>
      )}

      {hasFilters && (
        <button
          onClick={() => {
            onPriorityChange(null);
            onLabelChange(null);
            onAssigneeChange(null);
          }}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}
