"use client";

import { Kanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/filters/SearchBar";
import { BoardStats } from "./BoardStats";
import { LabelManager } from "@/components/labels/LabelManager";
import { TeamManager } from "@/components/members/TeamManager";
import type { Task, Label, TeamMember } from "@/lib/types";

interface HeaderProps {
  tasks: Task[];
  labels: Label[];
  members: TeamMember[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCreateLabel: (name: string, color: string) => Promise<Label | null>;
  onDeleteLabel: (id: string) => Promise<void>;
  onCreateMember: (name: string, color: string) => Promise<TeamMember | null>;
  onDeleteMember: (id: string) => Promise<void>;
  onNewTask: () => void;
}

export function Header({
  tasks,
  labels,
  members,
  searchQuery,
  onSearchChange,
  onCreateLabel,
  onDeleteLabel,
  onCreateMember,
  onDeleteMember,
  onNewTask,
}: HeaderProps) {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Kanban className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">TaskBoard</h1>
          </div>

          <div className="hidden md:block">
            <BoardStats tasks={tasks} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
          <TeamManager
            members={members}
            onCreateMember={onCreateMember}
            onDeleteMember={onDeleteMember}
          />
          <LabelManager
            labels={labels}
            onCreateLabel={onCreateLabel}
            onDeleteLabel={onDeleteLabel}
          />
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={onNewTask}>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>

      <div className="md:hidden px-4 pb-2 -mt-1">
        <BoardStats tasks={tasks} />
      </div>
    </header>
  );
}
