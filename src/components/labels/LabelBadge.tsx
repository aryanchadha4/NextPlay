"use client";

import { X } from "lucide-react";
import type { Label } from "@/lib/types";

interface LabelBadgeProps {
  label: Label;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function LabelBadge({ label, onRemove, size = "sm" }: LabelBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      }`}
      style={{
        backgroundColor: `${label.color}18`,
        color: label.color,
        border: `1px solid ${label.color}30`,
      }}
    >
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 -mr-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
