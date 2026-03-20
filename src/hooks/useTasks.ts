"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskStatus, Priority } from "@/lib/types";

export function useTasks(
  userId: string | null,
  getAccessToken: () => Promise<string | null>
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback(async () => {
    const token = await getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [getAccessToken]);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tasks", { headers: await authHeaders() });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to fetch tasks");
      }
      const data: Task[] = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    }
    setLoading(false);
  }, [userId, authHeaders]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (task: {
    title: string;
    description?: string;
    priority?: Priority;
    due_date?: string;
    status?: TaskStatus;
  }) => {
    if (!userId) return null;
    setError(null);

    const tempId = crypto.randomUUID();
    const optimistic: Task = {
      id: tempId,
      title: task.title,
      description: task.description || null,
      priority: task.priority || "normal",
      due_date: task.due_date || null,
      status: task.status || "todo",
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(task),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create task");
      }
      const data: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === tempId ? data : t)));
      return data;
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setError(err instanceof Error ? err.message : "Failed to create task");
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const original = tasks.find((t) => t.id === id);
    if (!original) return;
    setError(null);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, updated_at: new Date().toISOString() }
          : t
      )
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: await authHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to update task");
      }
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === id ? original : t)));
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    const original = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to delete task");
      }
    } catch (err) {
      if (original) setTasks((prev) => [...prev, original]);
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  return { tasks, loading, error, createTask, updateTask, deleteTask, refetch: fetchTasks };
}
