"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  BarChart3,
} from "lucide-react";
import { isAfter, startOfDay, format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { COLUMNS, type Task } from "@/lib/types";

interface BoardStatsProps {
  tasks: Task[];
}

function ProgressRing({
  percentage,
  size = 28,
}: {
  percentage: number;
  size?: number;
}) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted-foreground/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-emerald-500 transition-all duration-500"
      />
    </svg>
  );
}

export function BoardStats({ tasks }: BoardStatsProps) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdueTasks = tasks
      .filter(
        (t) =>
          t.due_date &&
          t.status !== "done" &&
          isAfter(today, new Date(t.due_date + "T00:00:00"))
      )
      .sort(
        (a, b) =>
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      );
    const highPriority = tasks.filter(
      (t) => t.priority === "high" && t.status !== "done"
    ).length;
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
    const columnCounts = COLUMNS.map((col) => ({
      ...col,
      count: tasks.filter((t) => t.status === col.id).length,
    }));

    return {
      total,
      done,
      overdueTasks,
      overdue: overdueTasks.length,
      highPriority,
      completionPct,
      columnCounts,
    };
  }, [tasks]);

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60 cursor-pointer select-none">
        <div className="relative flex items-center gap-1.5">
          <ProgressRing percentage={stats.completionPct} size={26} />
          <span className="text-xs font-semibold tabular-nums">
            {stats.completionPct}%
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            {stats.done}/{stats.total}
          </span>

          {stats.overdue > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              {stats.overdue} overdue
            </span>
          )}

          {stats.highPriority > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-600">
              <Flame className="h-3 w-3" />
              {stats.highPriority}
            </span>
          )}
        </div>

        <div className="flex lg:hidden items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">
            {stats.done}/{stats.total} done
          </span>
          {stats.overdue > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
              <AlertTriangle className="h-3 w-3" />
              {stats.overdue}
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start" sideOffset={8}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Board Summary</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {stats.total} task{stats.total !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-semibold text-emerald-600">
                {stats.completionPct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.completionPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              By Status
            </span>
            <div className="space-y-1.5">
              {stats.columnCounts.map((col) => {
                const pct =
                  stats.total > 0
                    ? Math.round((col.count / stats.total) * 100)
                    : 0;
                return (
                  <div key={col.id} className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${col.bg}`}
                    />
                    <span className="text-xs w-20 truncate">{col.title}</span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${col.bg} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-6 text-right tabular-nums">
                      {col.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {(stats.overdue > 0 || stats.highPriority > 0) && (
            <div className="space-y-2.5 border-t pt-3">
              {stats.overdue > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-medium text-red-600">
                      {stats.overdue} Overdue
                    </span>
                  </div>
                  <div className="space-y-1 pl-5">
                    {stats.overdueTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="truncate max-w-[180px] text-muted-foreground">
                          {task.title}
                        </span>
                        <span className="text-red-500/80 text-[10px] shrink-0 ml-2">
                          {task.due_date &&
                            format(
                              new Date(task.due_date + "T00:00:00"),
                              "MMM d"
                            )}
                        </span>
                      </div>
                    ))}
                    {stats.overdue > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        and {stats.overdue - 3} more...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {stats.highPriority > 0 && (
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-medium text-orange-600">
                    {stats.highPriority} High Priority
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    (not done)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
