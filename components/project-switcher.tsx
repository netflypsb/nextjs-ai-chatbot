"use client";

import { FolderOpen, Plus, X } from "lucide-react";
import { useCallback, useState } from "react";
import useSWR from "swr";
import { useActiveProject } from "@/hooks/use-active-project";
import type { Project } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ProjectSwitcher() {
  const { activeProject, setActiveProject } = useActiveProject();
  const { data: projects, mutate } = useSWR<Project[]>(
    "/api/projects",
    fetcher
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!newProjectName.trim()) {
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setActiveProject({ id: created.id, name: created.name });
        mutate();
        setShowCreateDialog(false);
        setNewProjectName("");
      }
    } finally {
      setIsCreating(false);
    }
  }, [newProjectName, setActiveProject, mutate]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="h-8 w-full justify-start gap-2 text-xs"
            variant="outline"
          >
            <FolderOpen className="size-3.5" />
            <span className="flex-1 truncate text-left">
              {activeProject ? activeProject.name : "All Chats"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Projects
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="gap-2"
            onSelect={() => setActiveProject(null)}
          >
            <span className="flex-1">All Chats</span>
            {!activeProject && (
              <span className="text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {projects && projects.length > 0 ? (
            projects.map((p) => (
              <DropdownMenuItem
                className="gap-2"
                key={p.id}
                onSelect={() =>
                  setActiveProject({ id: p.id, name: p.name })
                }
              >
                <FolderOpen className="size-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{p.name}</span>
                {activeProject?.id === p.id && (
                  <span className="text-xs text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-2 text-center text-muted-foreground text-xs">
              No projects yet
            </div>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => setShowCreateDialog(true)}
          >
            <Plus className="size-3.5" />
            <span>New Project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeProject && (
        <Button
          className="h-8 shrink-0 px-2"
          onClick={() => setActiveProject(null)}
          title="Clear project filter"
          variant="ghost"
        >
          <X className="size-3.5" />
        </Button>
      )}

      <Dialog onOpenChange={setShowCreateDialog} open={showCreateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your chats and artifacts.
            </DialogDescription>
          </DialogHeader>
          <input
            autoFocus
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreate();
              }
            }}
            placeholder="Project name..."
            value={newProjectName}
          />
          <DialogFooter>
            <Button
              disabled={!newProjectName.trim() || isCreating}
              onClick={handleCreate}
              size="sm"
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
