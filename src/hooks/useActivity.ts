"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActivityEntry } from "@/lib/types";

export function useActivity(
  taskId: string | null | undefined,
  getAccessToken: () => Promise<string | null>
) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(async () => {
    const token = await getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [getAccessToken]);

  const fetchActivity = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tasks/${id}/activity`, {
          headers: await authHeaders(),
        });
        if (res.ok) {
          const data: ActivityEntry[] = await res.json();
          setActivities(data);
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
      fetchActivity(taskId);
    } else {
      setActivities([]);
    }
  }, [taskId, fetchActivity]);

  return {
    activities,
    loading,
    refetch: fetchActivity,
  };
}
