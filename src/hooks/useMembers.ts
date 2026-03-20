"use client";

import { useState, useEffect, useCallback } from "react";
import type { TeamMember, TaskAssignee } from "@/lib/types";

export function useMembers(
  userId: string | null,
  getAccessToken: () => Promise<string | null>
) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<TaskAssignee[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(async () => {
    const token = await getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [getAccessToken]);

  const fetchMembers = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/members", { headers: await authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members as TeamMember[]);
      setTaskAssignees(data.taskAssignees as TaskAssignee[]);
    } catch {
      /* silently fail */
    }
    setLoading(false);
  }, [userId, authHeaders]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const createMember = async (name: string, color: string) => {
    if (!userId) return null;
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) return null;
      const data: TeamMember = await res.json();
      setMembers((prev) => [...prev, data]);
      return data;
    } catch {
      return null;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setTaskAssignees((prev) => prev.filter((ta) => ta.member_id !== id));
      }
    } catch {
      /* silently fail */
    }
  };

  const assignToTask = async (taskId: string, memberId: string) => {
    if (!userId) return;
    const exists = taskAssignees.find(
      (ta) => ta.task_id === taskId && ta.member_id === memberId
    );
    if (exists) return;

    const newTa: TaskAssignee = { task_id: taskId, member_id: memberId, user_id: userId };
    setTaskAssignees((prev) => [...prev, newTa]);

    try {
      const res = await fetch(`/api/tasks/${taskId}/assignees`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ member_id: memberId }),
      });
      if (!res.ok) {
        setTaskAssignees((prev) =>
          prev.filter(
            (ta) => !(ta.task_id === taskId && ta.member_id === memberId)
          )
        );
      }
    } catch {
      setTaskAssignees((prev) =>
        prev.filter(
          (ta) => !(ta.task_id === taskId && ta.member_id === memberId)
        )
      );
    }
  };

  const unassignFromTask = async (taskId: string, memberId: string) => {
    setTaskAssignees((prev) =>
      prev.filter(
        (ta) => !(ta.task_id === taskId && ta.member_id === memberId)
      )
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}/assignees/${memberId}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) fetchMembers();
    } catch {
      fetchMembers();
    }
  };

  const getMembersForTask = useCallback(
    (taskId: string): TeamMember[] => {
      const ids = taskAssignees
        .filter((ta) => ta.task_id === taskId)
        .map((ta) => ta.member_id);
      return members.filter((m) => ids.includes(m.id));
    },
    [taskAssignees, members]
  );

  return {
    members,
    taskAssignees,
    loading,
    createMember,
    deleteMember,
    assignToTask,
    unassignFromTask,
    getMembersForTask,
    refetch: fetchMembers,
  };
}
