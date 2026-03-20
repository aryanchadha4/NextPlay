"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useLabels } from "@/hooks/useLabels";
import { useMembers } from "@/hooks/useMembers";
import { useComments } from "@/hooks/useComments";
import { useActivity } from "@/hooks/useActivity";
import { Header } from "@/components/layout/Header";
import { FilterBar } from "@/components/filters/FilterBar";
import { Board } from "@/components/board/Board";
import { NewTaskDialog } from "@/components/board/NewTaskDialog";
import { TaskDetail } from "@/components/board/TaskDetail";
import type { Task, TaskStatus, Priority } from "@/lib/types";

export default function HomePage() {
  const { userId, loading: authLoading, getAccessToken } = useAuth();
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(userId, getAccessToken);
  const {
    labels,
    loading: labelsLoading,
    createLabel,
    deleteLabel,
    addLabelToTask,
    removeLabelFromTask,
    getLabelsForTask,
  } = useLabels(userId, getAccessToken);
  const {
    members,
    loading: membersLoading,
    createMember,
    deleteMember,
    assignToTask,
    unassignFromTask,
    getMembersForTask,
  } = useMembers(userId, getAccessToken);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const {
    comments,
    loading: commentsLoading,
    addComment,
    deleteComment,
  } = useComments(selectedTask?.id, getAccessToken);
  const {
    activities,
    loading: activitiesLoading,
  } = useActivity(selectedTask?.id, getAccessToken);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (labelFilter) {
      result = result.filter((t) => {
        const tl = getLabelsForTask(t.id);
        return tl.some((l) => l.id === labelFilter);
      });
    }

    if (assigneeFilter) {
      result = result.filter((t) => {
        const assignees = getMembersForTask(t.id);
        return assignees.some((m) => m.id === assigneeFilter);
      });
    }

    return result;
  }, [tasks, searchQuery, priorityFilter, labelFilter, assigneeFilter, getLabelsForTask, getMembersForTask]);

  const handleAddTask = useCallback((status: TaskStatus) => {
    setNewTaskStatus(status);
    setNewTaskOpen(true);
  }, []);

  const handleCreateTask = useCallback(
    async (task: Parameters<typeof createTask>[0], labelIds: string[]) => {
      const result = await createTask(task);
      if (result) {
        for (const labelId of labelIds) {
          await addLabelToTask(result.id, labelId);
        }
        toast.success("Task created");
      } else {
        toast.error("Failed to create task");
      }
      return result;
    },
    [createTask, addLabelToTask]
  );

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      await updateTask(id, updates);
      setSelectedTask((prev) =>
        prev?.id === id ? { ...prev, ...updates } : prev
      );
    },
    [updateTask]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      await deleteTask(id);
      toast.success("Task deleted");
    },
    [deleteTask]
  );

  const lastError = useRef<string | null>(null);
  useEffect(() => {
    if (tasksError && tasksError !== lastError.current) {
      lastError.current = tasksError;
      toast.error(tasksError);
    }
  }, [tasksError]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  const isLoading = tasksLoading || labelsLoading || membersLoading;

  return (
    <div className="flex h-screen flex-col">
      <Header
        tasks={tasks}
        labels={labels}
        members={members}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateLabel={createLabel}
        onDeleteLabel={deleteLabel}
        onCreateMember={createMember}
        onDeleteMember={deleteMember}
        onNewTask={() => handleAddTask("todo")}
      />

      <div className="px-4 py-2 md:px-6">
        <FilterBar
          priorityFilter={priorityFilter}
          labelFilter={labelFilter}
          assigneeFilter={assigneeFilter}
          labels={labels}
          members={members}
          onPriorityChange={setPriorityFilter}
          onLabelChange={setLabelFilter}
          onAssigneeChange={setAssigneeFilter}
        />
      </div>

      <main className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex gap-4 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-72 shrink-0 md:w-80">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                </div>
                <div className="space-y-2 rounded-xl bg-muted/40 p-2">
                  {Array.from({ length: 2 + i }).map((_, j) => (
                    <div
                      key={j}
                      className="h-24 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Board
            tasks={filteredTasks}
            getLabelsForTask={getLabelsForTask}
            getMembersForTask={getMembersForTask}
            onUpdateTask={handleUpdateTask}
            onTaskClick={setSelectedTask}
            onAddTask={handleAddTask}
          />
        )}
      </main>

      <NewTaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        defaultStatus={newTaskStatus}
        labels={labels}
        onCreateLabel={createLabel}
        onSubmit={handleCreateTask}
      />

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          allLabels={labels}
          taskLabels={getLabelsForTask(selectedTask.id)}
          allMembers={members}
          taskAssignees={getMembersForTask(selectedTask.id)}
          comments={comments}
          commentsLoading={commentsLoading}
          activities={activities}
          activitiesLoading={activitiesLoading}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onAddLabel={addLabelToTask}
          onRemoveLabel={removeLabelFromTask}
          onCreateLabel={createLabel}
          onAssignMember={assignToTask}
          onUnassignMember={unassignFromTask}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
        />
      )}
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
