export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type Priority = "low" | "normal" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface TaskLabel {
  task_id: string;
  label_id: string;
  user_id: string;
}

export const COLUMNS: {
  id: TaskStatus;
  title: string;
  accent: string;
  bg: string;
  iconBg: string;
}[] = [
  {
    id: "todo",
    title: "To Do",
    accent: "text-blue-600",
    bg: "bg-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    id: "in_progress",
    title: "In Progress",
    accent: "text-amber-600",
    bg: "bg-amber-500",
    iconBg: "bg-amber-50",
  },
  {
    id: "in_review",
    title: "In Review",
    accent: "text-purple-600",
    bg: "bg-purple-500",
    iconBg: "bg-purple-50",
  },
  {
    id: "done",
    title: "Done",
    accent: "text-emerald-600",
    bg: "bg-emerald-500",
    iconBg: "bg-emerald-50",
  },
];

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; border: string; dot: string }
> = {
  low: {
    label: "Low",
    color: "bg-emerald-50 text-emerald-700",
    border: "border-l-emerald-400",
    dot: "bg-emerald-500",
  },
  normal: {
    label: "Normal",
    color: "bg-amber-50 text-amber-700",
    border: "border-l-amber-400",
    dot: "bg-amber-500",
  },
  high: {
    label: "High",
    color: "bg-red-50 text-red-700",
    border: "border-l-red-400",
    dot: "bg-red-500",
  },
};

export interface TeamMember {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface TaskAssignee {
  task_id: string;
  member_id: string;
  user_id: string;
}

export interface ActivityEntry {
  id: string;
  task_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export const MEMBER_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#64748b",
];

export const LABEL_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];
