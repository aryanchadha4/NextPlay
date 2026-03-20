"use client";

import { useState } from "react";
import { Tag, Plus, Trash2, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Label } from "@/lib/types";
import { LABEL_COLORS } from "@/lib/types";

interface LabelManagerProps {
  labels: Label[];
  onCreateLabel: (name: string, color: string) => Promise<Label | null>;
  onDeleteLabel: (id: string) => Promise<void>;
}

export function LabelManager({
  labels,
  onCreateLabel,
  onDeleteLabel,
}: LabelManagerProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[0]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await onCreateLabel(name.trim(), color);
    setName("");
    setCreating(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium h-8 gap-1.5 px-2.5 text-xs transition-colors">
        <Tag className="h-3.5 w-3.5" />
        Labels
        {labels.length > 0 && (
          <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px]">
            {labels.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Labels</h4>
            <button
              onClick={() => setCreating(!creating)}
              className="text-muted-foreground hover:text-foreground"
            >
              {creating ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </div>

          {creating && (
            <div className="space-y-2 rounded-lg border p-2">
              <Input
                placeholder="Label name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-7 text-xs"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-1 flex-wrap">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-5 w-5 rounded-full transition-all",
                      color === c
                        ? "ring-2 ring-offset-1 ring-foreground/40 scale-110"
                        : "hover:scale-110"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={handleCreate}
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground h-6 text-xs font-medium"
              >
                Create
              </button>
            </div>
          )}

          {labels.length === 0 && !creating && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No labels yet
            </p>
          )}

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted group"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm">{label.name}</span>
                </div>
                <button
                  onClick={() => onDeleteLabel(label.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
