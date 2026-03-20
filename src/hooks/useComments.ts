"use client";

import { useState, useEffect, useCallback } from "react";
import type { Comment } from "@/lib/types";

export function useComments(
  taskId: string | null | undefined,
  getAccessToken: () => Promise<string | null>
) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(async () => {
    const token = await getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [getAccessToken]);

  const fetchComments = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tasks/${id}/comments`, {
          headers: await authHeaders(),
        });
        if (res.ok) {
          const data: Comment[] = await res.json();
          setComments(data);
        }
      } catch {
        /* silently fail */
      }
      setLoading(false);
    },
    [authHeaders]
  );

  useEffect(() => {
    if (taskId) {
      fetchComments(taskId);
    } else {
      setComments([]);
    }
  }, [taskId, fetchComments]);

  const addComment = async (targetTaskId: string, content: string) => {
    try {
      const res = await fetch(`/api/tasks/${targetTaskId}/comments`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data: Comment = await res.json();
        setComments((prev) => [...prev, data]);
        return data;
      }
    } catch {
      /* silently fail */
    }
    return null;
  };

  const deleteComment = async (targetTaskId: string, commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      const res = await fetch(
        `/api/tasks/${targetTaskId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: await authHeaders(),
        }
      );
      if (!res.ok && taskId) {
        fetchComments(taskId);
      }
    } catch {
      if (taskId) fetchComments(taskId);
    }
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
  };
}
