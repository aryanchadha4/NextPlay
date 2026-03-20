"use client";

import { useState, useEffect } from "react";
import { Tag, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Label, Priority, TaskStatus } from "@/lib/types";
import { PRIORITY_CONFIG, COLUMNS, LABEL_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LabelBadge } from "@/components/labels/LabelBadge";

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: TaskStatus;
  labels: Label[];
  onCreateLabel: (name: string, color: string) => Promise<Label | null>;
  onSubmit: (
    task: {
      title: string;
      description?: string;
      priority?: Priority;
      due_date?: string;
      status?: TaskStatus;
    },
    labelIds: string[]
  ) => Promise<unknown>;
}

export function NewTaskDialog({
  open,
  onOpenChange,
  defaultStatus,
  labels,
  onCreateLabel,
  onSubmit,
}: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [showLabelCreator, setShowLabelCreator] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setStatus(defaultStatus);
  }, [defaultStatus]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority("normal");
    setDueDate("");
    setStatus(defaultStatus);
    setSelectedLabelIds([]);
    setShowLabelCreator(false);
    setNewLabelName("");
    setNewLabelColor(LABEL_COLORS[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    await onSubmit(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        status,
      },
      selectedLabelIds
    );
    setSubmitting(false);
    reset();
    onOpenChange(false);
  };

  const toggleLabel = (id: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    const label = await onCreateLabel(newLabelName.trim(), newLabelColor);
    if (label) {
      setSelectedLabelIds((prev) => [...prev, label.id]);
      setNewLabelName("");
      setShowLabelCreator(false);
    }
  };

  const selectedLabels = labels.filter((l) => selectedLabelIds.includes(l.id));
  const availableLabels = labels.filter(
    (l) => !selectedLabelIds.includes(l.id)
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="text-base"
            />
          </div>

          <div>
            <Textarea
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex gap-2 flex-wrap">
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setStatus(col.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                    status === col.id
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                    priority === p
                      ? "border-foreground/20 bg-foreground/5"
                      : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      PRIORITY_CONFIG[p].dot
                    )}
                  />
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              Labels
            </label>

            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedLabels.map((label) => (
                  <LabelBadge
                    key={label.id}
                    label={label}
                    size="md"
                    onRemove={() => toggleLabel(label.id)}
                  />
                ))}
              </div>
            )}

            {availableLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {availableLabels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
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
            )}

            {!showLabelCreator ? (
              <button
                type="button"
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateLabel();
                    }
                  }}
                />
                <div className="flex gap-1.5 flex-wrap">
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
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
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleCreateLabel}
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || submitting}>
              {submitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
