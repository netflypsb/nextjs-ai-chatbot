"use client";

import { Settings2 } from "lucide-react";
import { TOOL_CATEGORIES, useToolSettings } from "@/hooks/use-tool-settings";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

function ToggleSwitch({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
      onClick={onToggle}
      type="button"
    >
      <span
        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function ToolSettings() {
  const { categoryEnabled, toggleCategory } = useToolSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full justify-start gap-2" variant="ghost">
          <Settings2 className="size-4" />
          <span>Tool Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tool Settings</DialogTitle>
          <DialogDescription>
            Enable or disable tool categories available to the AI agent.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          {TOOL_CATEGORIES.map((cat) => (
            <div
              className="flex items-center justify-between rounded-lg border p-3"
              key={cat.id}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">{cat.name}</span>
                <span className="text-muted-foreground text-xs">
                  {cat.description}
                </span>
              </div>
              <ToggleSwitch
                checked={categoryEnabled[cat.id] !== false}
                onToggle={() => toggleCategory(cat.id)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
