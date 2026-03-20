"use client";

import { useState, useEffect, useCallback } from "react";
import type { Label, TaskLabel } from "@/lib/types";

export function useLabels(
  userId: string | null,
  getAccessToken: () => Promise<string | null>
) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(async () => {
    const token = await getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [getAccessToken]);

  const fetchLabels = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/labels", { headers: await authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setLabels(data.labels as Label[]);
      setTaskLabels(data.taskLabels as TaskLabel[]);
    } catch {
      /* silently fail */
    }
    setLoading(false);
  }, [userId, authHeaders]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const createLabel = async (name: string, color: string) => {
    if (!userId) return null;
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) return null;
      const data: Label = await res.json();
      setLabels((prev) => [...prev, data]);
      return data;
    } catch {
      return null;
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      const res = await fetch(`/api/labels/${id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (res.ok) {
        setLabels((prev) => prev.filter((l) => l.id !== id));
        setTaskLabels((prev) => prev.filter((tl) => tl.label_id !== id));
      }
    } catch {
      /* silently fail */
    }
  };

  const addLabelToTask = async (taskId: string, labelId: string) => {
    if (!userId) return;
    const exists = taskLabels.find(
      (tl) => tl.task_id === taskId && tl.label_id === labelId
    );
    if (exists) return;

    const newTl: TaskLabel = { task_id: taskId, label_id: labelId, user_id: userId };
    setTaskLabels((prev) => [...prev, newTl]);

    try {
      const res = await fetch(`/api/tasks/${taskId}/labels`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ label_id: labelId }),
      });
      if (!res.ok) {
        setTaskLabels((prev) =>
          prev.filter(
            (tl) => !(tl.task_id === taskId && tl.label_id === labelId)
          )
        );
      }
    } catch {
      setTaskLabels((prev) =>
        prev.filter(
          (tl) => !(tl.task_id === taskId && tl.label_id === labelId)
        )
      );
    }
  };

  const removeLabelFromTask = async (taskId: string, labelId: string) => {
    setTaskLabels((prev) =>
      prev.filter(
        (tl) => !(tl.task_id === taskId && tl.label_id === labelId)
      )
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}/labels/${labelId}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) fetchLabels();
    } catch {
      fetchLabels();
    }
  };

  const getLabelsForTask = useCallback(
    (taskId: string): Label[] => {
      const ids = taskLabels
        .filter((tl) => tl.task_id === taskId)
        .map((tl) => tl.label_id);
      return labels.filter((l) => ids.includes(l.id));
    },
    [taskLabels, labels]
  );

  return {
    labels,
    taskLabels,
    loading,
    createLabel,
    deleteLabel,
    addLabelToTask,
    removeLabelFromTask,
    getLabelsForTask,
    refetch: fetchLabels,
  };
}
