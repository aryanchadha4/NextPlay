"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { COLUMNS } from "@/lib/types";
import type { Task, TaskStatus, Label, TeamMember } from "@/lib/types";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";

interface BoardProps {
  tasks: Task[];
  getLabelsForTask: (taskId: string) => Label[];
  getMembersForTask: (taskId: string) => TeamMember[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function Board({
  tasks,
  getLabelsForTask,
  getMembersForTask,
  onUpdateTask,
  onTaskClick,
  onAddTask,
}: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 6 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      const task = tasks.find((t) => t.id === taskId);

      if (task && task.status !== newStatus) {
        onUpdateTask(taskId, { status: newStatus });
      }
    },
    [tasks, onUpdateTask]
  );

  const tasksByColumn = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-4 pb-8">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            status={col.id}
            tasks={tasksByColumn[col.id]}
            getLabelsForTask={getLabelsForTask}
            getMembersForTask={getMembersForTask}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <TaskCard
            task={activeTask}
            labels={getLabelsForTask(activeTask.id)}
            assignees={getMembersForTask(activeTask.id)}
            onClick={() => {}}
            overlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
