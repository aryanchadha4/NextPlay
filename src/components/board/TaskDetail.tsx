"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { X, Trash2, Calendar, Tag, Users, MessageSquare, Send, Loader2, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Task, Label, TeamMember, Comment, ActivityEntry, Priority, TaskStatus } from "@/lib/types";
import { PRIORITY_CONFIG, COLUMNS, LABEL_COLORS } from "@/lib/types";
import { LabelBadge } from "@/components/labels/LabelBadge";
import { MemberAvatar } from "@/components/members/MemberAvatar";

const STATUS_NAMES: Record<string, string> = Object.fromEntries(
  COLUMNS.map((c) => [c.id, c.title])
);
const PRIORITY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(PRIORITY_CONFIG).map(([k, v]) => [k, v.label])
);

function describeActivity(entry: ActivityEntry): string {
  const { action, old_value, new_value } = entry;
  switch (action) {
    case "status_change":
      return `Moved from ${STATUS_NAMES[old_value ?? ""] ?? old_value} → ${STATUS_NAMES[new_value ?? ""] ?? new_value}`;
    case "priority_change":
      return `Changed priority from ${PRIORITY_NAMES[old_value ?? ""] ?? old_value} to ${PRIORITY_NAMES[new_value ?? ""] ?? new_value}`;
    case "title_change":
      return "Updated the title";
    case "description_change":
      return "Updated the description";
    case "due_date_change":
      if (!new_value) return "Removed the due date";
      return `Set due date to ${new_value}`;
    case "assignee_added":
      return `Assigned ${new_value}`;
    case "assignee_removed":
      return `Unassigned ${old_value}`;
    case "task_created":
      return "Created this task";
    default:
      return action.replace(/_/g, " ");
  }
}

interface TaskDetailProps {
  task: Task | null;
  allLabels: Label[];
  taskLabels: Label[];
  allMembers: TeamMember[];
  taskAssignees: TeamMember[];
  comments: Comment[];
  commentsLoading: boolean;
  activities: ActivityEntry[];
  activitiesLoading: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddLabel: (taskId: string, labelId: string) => Promise<void>;
  onRemoveLabel: (taskId: string, labelId: string) => Promise<void>;
  onCreateLabel: (name: string, color: string) => Promise<Label | null>;
  onAssignMember: (taskId: string, memberId: string) => Promise<void>;
  onUnassignMember: (taskId: string, memberId: string) => Promise<void>;
  onAddComment: (taskId: string, content: string) => Promise<Comment | null>;
  onDeleteComment: (taskId: string, commentId: string) => Promise<void>;
}

export function TaskDetail({
  task,
  allLabels,
  taskLabels,
  allMembers,
  taskAssignees,
  comments,
  commentsLoading,
  activities,
  activitiesLoading,
  onClose,
  onUpdate,
  onDelete,
  onAddLabel,
  onRemoveLabel,
  onCreateLabel,
  onAssignMember,
  onUnassignMember,
  onAddComment,
  onDeleteComment,
}: TaskDetailProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showLabelCreator, setShowLabelCreator] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const titleRef = useRef(title);
  const descriptionRef = useRef(description);
  titleRef.current = title;
  descriptionRef.current = description;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    }
  }, [task]);

  const flushPendingEdits = useCallback(() => {
    if (!task) return;
    const t = titleRef.current.trim();
    if (t && t !== task.title) {
      onUpdate(task.id, { title: t });
    }
    const d = descriptionRef.current.trim() || null;
    if (d !== task.description) {
      onUpdate(task.id, { description: d });
    }
  }, [task, onUpdate]);

  const handleClose = useCallback(() => {
    flushPendingEdits();
    onClose();
  }, [flushPendingEdits, onClose]);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdate(task.id, { title: title.trim() });
    }
  };

  const handleDescBlur = () => {
    const val = description.trim() || null;
    if (val !== task.description) {
      onUpdate(task.id, { description: val });
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    const label = await onCreateLabel(newLabelName.trim(), newLabelColor);
    if (label) {
      await onAddLabel(task.id, label.id);
      setNewLabelName("");
      setShowLabelCreator(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !task) return;
    setPostingComment(true);
    await onAddComment(task.id, commentText.trim());
    setCommentText("");
    setPostingComment(false);
  };

  const unassignedLabels = allLabels.filter(
    (l) => !taskLabels.find((tl) => tl.id === l.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-background shadow-2xl border-l animate-in slide-in-from-right-full duration-200 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background px-6 py-4 border-b">
          <span className="text-xs text-muted-foreground">
            Created {format(new Date(task.created_at), "MMM d, yyyy")}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => {
                onDelete(task.id);
                handleClose();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 h-auto"
            placeholder="Task title"
          />

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => onUpdate(task.id, { status: col.id })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                    task.status === col.id
                      ? "border-foreground/20 bg-foreground/5"
                      : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", col.bg)} />
                  {col.title}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Priority
            </label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdate(task.id, { priority: p })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                    task.priority === p
                      ? "border-foreground/20 bg-foreground/5"
                      : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", PRIORITY_CONFIG[p].dot)}
                  />
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Users className="h-3 w-3" />
              Assignees
            </label>

            {taskAssignees.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {taskAssignees.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => onUnassignMember(task.id, member.id)}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors group"
                  >
                    <MemberAvatar member={member} size="sm" />
                    {member.name}
                    <X className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {(() => {
              const unassigned = allMembers.filter(
                (m) => !taskAssignees.find((a) => a.id === m.id)
              );
              if (unassigned.length === 0) return null;
              return (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Assign member:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {unassigned.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => onAssignMember(task.id, member.id)}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
                      >
                        <MemberAvatar member={member} size="sm" />
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {allMembers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Create team members from the header to assign them here.
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due Date
            </label>
            <Input
              type="date"
              value={task.due_date || ""}
              onChange={(e) =>
                onUpdate(task.id, { due_date: e.target.value || null })
              }
              className="w-fit"
            />
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescBlur}
              placeholder="Add a description..."
              rows={4}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Labels */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Labels
            </label>

            {taskLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {taskLabels.map((label) => (
                  <LabelBadge
                    key={label.id}
                    label={label}
                    size="md"
                    onRemove={() => onRemoveLabel(task.id, label.id)}
                  />
                ))}
              </div>
            )}

            {unassignedLabels.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Add label:</p>
                <div className="flex flex-wrap gap-1.5">
                  {unassignedLabels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => onAddLabel(task.id, label.id)}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showLabelCreator ? (
              <button
                onClick={() => setShowLabelCreator(true)}
                className="text-xs text-primary hover:underline"
              >
                + Create new label
              </button>
            ) : (
              <div className="space-y-2 rounded-lg border p-3">
                <Input
                  placeholder="Label name"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
                <div className="flex gap-1.5 flex-wrap">
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewLabelColor(c)}
                      className={cn(
                        "h-6 w-6 rounded-full transition-all",
                        newLabelColor === c
                          ? "ring-2 ring-offset-2 ring-foreground/40 scale-110"
                          : "hover:scale-110"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleCreateLabel}>
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setShowLabelCreator(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Comments */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Comments
              {comments.length > 0 && (
                <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] font-normal">
                  {comments.length}
                </span>
              )}
            </label>

            {commentsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {comments.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No comments yet
                  </p>
                )}
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="group rounded-lg border p-3 space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      <button
                        onClick={() => onDeleteComment(task.id, comment.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all mt-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handlePostComment();
                  }
                }}
              />
              <Button
                size="icon"
                className="h-auto shrink-0 self-end"
                disabled={!commentText.trim() || postingComment}
                onClick={handlePostComment}
              >
                {postingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Activity Log */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <History className="h-3 w-3" />
              Activity
              {activities.length > 0 && (
                <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] font-normal">
                  {activities.length}
                </span>
              )}
            </label>

            {activitiesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                No activity yet
              </p>
            ) : (
              <div className="space-y-0">
                {activities.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="relative flex gap-3 pb-3 last:pb-0"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      {idx < activities.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs leading-relaxed text-foreground/80">
                        {describeActivity(entry)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
