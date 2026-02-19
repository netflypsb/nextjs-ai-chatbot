"use client";

import { memo, useMemo, useState } from "react";
import { useArtifact } from "@/hooks/use-artifact";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { UIArtifact } from "./artifact";
import { ChevronDownIcon } from "./icons";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type ArtifactRef = {
  id: string;
  title: string;
  kind: string;
};

function extractArtifactsFromMessages(messages: ChatMessage[]): ArtifactRef[] {
  const artifacts: ArtifactRef[] = [];
  const seen = new Set<string>();

  for (const msg of messages) {
    if (!msg.parts) {
      continue;
    }

    for (const part of msg.parts) {
      const partAny = part as any;
      if (
        partAny.type === "tool-createDocument" ||
        partAny.type === "tool-updateDocument" ||
        partAny.type === "tool-createPlan" ||
        partAny.type === "tool-updatePlan"
      ) {
        const output = partAny.output;
        if (output?.id && output?.title && !seen.has(output.id)) {
          seen.add(output.id);
          artifacts.push({
            id: output.id,
            title: output.title,
            kind: output.kind || "text",
          });
        }
      }
    }
  }

  return artifacts;
}

const kindLabels: Record<string, string> = {
  text: "📄",
  code: "💻",
  sheet: "📊",
  plan: "📋",
  image: "🖼️",
  presentation: "📽️",
  webview: "🌐",
};

function PureArtifactSelector({
  messages,
  className,
}: {
  chatId: string;
  messages: ChatMessage[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { setArtifact } = useArtifact();

  const artifacts = useMemo(
    () => extractArtifactsFromMessages(messages),
    [messages]
  );

  const planArtifact = useMemo(
    () => artifacts.find((a) => a.kind === "plan"),
    [artifacts]
  );

  const nonPlanArtifacts = useMemo(
    () => artifacts.filter((a) => a.kind !== "plan"),
    [artifacts]
  );

  const openArtifact = (ref: ArtifactRef) => {
    setArtifact((current: UIArtifact) => ({
      ...current,
      title: ref.title,
      documentId: ref.id,
      kind: ref.kind as UIArtifact["kind"],
      isVisible: true,
      boundingBox: {
        left: window.innerWidth / 2,
        top: window.innerHeight / 2,
        width: 100,
        height: 50,
      },
    }));
    setOpen(false);
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="hidden h-8 gap-1.5 md:flex md:h-fit md:px-2"
          variant="outline"
        >
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span className="text-xs">Artifacts</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[280px]">
        {planArtifact && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Plan
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="flex items-center gap-2"
              onSelect={() => openArtifact(planArtifact)}
            >
              <span>{kindLabels.plan}</span>
              <span className="truncate">{planArtifact.title}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Artifacts ({nonPlanArtifacts.length})
        </DropdownMenuLabel>

        {nonPlanArtifacts.length === 0 ? (
          <div className="px-2 py-3 text-center text-muted-foreground text-xs">
            No artifacts created yet in this chat.
          </div>
        ) : (
          nonPlanArtifacts.map((ref) => (
            <DropdownMenuItem
              className="group flex items-center gap-2"
              key={ref.id}
              onSelect={() => openArtifact(ref)}
            >
              <span>{kindLabels[ref.kind] || "📄"}</span>
              <span className="flex-1 truncate">{ref.title}</span>
              <span className="text-muted-foreground text-xs opacity-60">
                {ref.kind}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ArtifactSelector = memo(
  PureArtifactSelector,
  (prevProps, nextProps) => {
    return (
      prevProps.chatId === nextProps.chatId &&
      prevProps.messages.length === nextProps.messages.length
    );
  }
);
