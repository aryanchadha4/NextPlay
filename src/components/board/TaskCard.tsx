"use client";

import { useDraggable } from "@dnd-kit/core";
import { differenceInCalendarDays, format } from "date-fns";
import { AlertTriangle, Calendar, Clock, GripVertical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Label, TeamMember } from "@/lib/types";
import { PRIORITY_CONFIG } from "@/lib/types";
import { LabelBadge } from "@/components/labels/LabelBadge";
import { AvatarGroup } from "@/components/members/MemberAvatar";

interface TaskCardProps {
  task: Task;
  labels: Label[];
  assignees?: TeamMember[];
  onClick: () => void;
  overlay?: boolean;
}

function dueDateInfo(dateStr: string): {
  text: string;
  icon: LucideIcon;
  className: string;
  animate: boolean;
} {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = differenceInCalendarDays(date, today);

  if (daysUntil < 0)
    return { text: "Overdue", icon: AlertTriangle, animate: true,
      className: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950" };
  if (daysUntil === 0)
    return { text: "Due today", icon: Clock, animate: false,
      className: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950" };
  if (daysUntil === 1)
    return { text: "Tomorrow", icon: Clock, animate: false,
      className: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950" };
  if (daysUntil <= 3)
    return { text: `In ${daysUntil} days`, icon: Calendar, animate: false,
      className: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950" };
  return { text: format(date, "MMM d"), icon: Calendar, animate: false,
    className: "text-muted-foreground bg-muted" };
}

export function TaskCard({ task, labels, assignees = [], onClick, overlay }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id, data: { task } });

  const priority = PRIORITY_CONFIG[task.priority];
  const due = task.due_date ? dueDateInfo(task.due_date) : null;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={!overlay ? setNodeRef : undefined}
      style={!overlay ? style : undefined}
      className={cn(
        "group relative rounded-lg border bg-card p-3 transition-all cursor-pointer border-l-[3px]",
        priority.border,
        overlay
          ? "shadow-xl rotate-[2deg] scale-105 opacity-90"
          : isDragging
            ? "opacity-30"
            : "hover:shadow-md hover:-translate-y-0.5"
      )}
      onClick={onClick}
    >
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-medium pr-6 leading-snug">{task.title}</h3>

      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              priority.color
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
            {priority.label}
          </span>

          {due && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                due.className,
                due.animate && "animate-pulse"
              )}
            >
              <due.icon className="h-3 w-3" />
              {due.text}
            </span>
          )}
        </div>

        {assignees.length > 0 && <AvatarGroup members={assignees} max={3} />}
      </div>
    </div>
  );
}
