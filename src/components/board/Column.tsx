"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Label, TeamMember, TaskStatus } from "@/lib/types";
import { COLUMNS } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  getLabelsForTask: (taskId: string) => Label[];
  getMembersForTask: (taskId: string) => TeamMember[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function Column({
  status,
  tasks,
  getLabelsForTask,
  getMembersForTask,
  onTaskClick,
  onAddTask,
}: ColumnProps) {
  const column = COLUMNS.find((c) => c.id === status)!;
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col md:w-80">
      <div className="mb-3 flex items-center gap-2 px-1">
        <div className={cn("h-2.5 w-2.5 rounded-full", column.bg)} />
        <h2 className="text-sm font-semibold">{column.title}</h2>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-xl p-2 transition-colors min-h-[200px]",
          isOver ? "bg-accent/80 ring-2 ring-primary/20" : "bg-muted/40"
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            labels={getLabelsForTask(task.id)}
            assignees={getMembersForTask(task.id)}
            onClick={() => onTaskClick(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-4">
            <p className="text-xs text-muted-foreground/60">
              No tasks yet
            </p>
          </div>
        )}

        <button
          onClick={() => onAddTask(status)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      </div>
    </div>
  );
}
