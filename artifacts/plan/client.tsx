import { useMemo } from "react";
import { toast } from "sonner";
import { Artifact } from "@/components/create-artifact";
import { DiffView } from "@/components/diffview";
import { DocumentSkeleton } from "@/components/document-skeleton";
import {
  CopyIcon,
  DownloadIcon,
  MessageIcon,
  RedoIcon,
  UndoIcon,
} from "@/components/icons";
import { Editor } from "@/components/text-editor";

type PlanStep = {
  text: string;
  done: boolean;
  indent: number;
};

function parsePlanSteps(
  content: string
): { title: string; steps: PlanStep[] } | null {
  const lines = content.split("\n");
  let title = "";
  const steps: PlanStep[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Extract title from first heading
    if (!title && trimmed.startsWith("# ")) {
      title = trimmed.slice(2).trim();
      continue;
    }

    // Parse checkbox items: - [x] or - [ ] or * [x] etc
    const checkboxMatch = trimmed.match(/^[-*]\s*\[([ xX])\]\s*(.+)/);
    if (checkboxMatch) {
      const indent = line.search(/\S/);
      steps.push({
        text: checkboxMatch[2].trim(),
        done: checkboxMatch[1].toLowerCase() === "x",
        indent: Math.floor(indent / 2),
      });
    }
  }

  if (steps.length === 0) {
    return null;
  }

  return { title, steps };
}

function PlanRenderer({
  content,
  status,
}: {
  content: string;
  status: "streaming" | "idle";
}) {
  const parsed = useMemo(() => parsePlanSteps(content), [content]);

  if (!parsed) {
    // Not a structured plan, render as markdown
    return null;
  }

  const { title, steps } = parsed;
  const completedCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 p-6">
      {title && <h2 className="font-semibold text-lg">{title}</h2>}

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>
            {completedCount} of {totalCount} steps complete
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="flex flex-col gap-1">
        {steps.map((step, i) => (
          <div
            className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
            key={`step-${i}-${step.text.slice(0, 20)}`}
            style={{ paddingLeft: `${12 + step.indent * 20}px` }}
          >
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
              {step.done ? (
                <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg
                    className="size-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div className="size-5 rounded-full border-2 border-muted-foreground/30" />
              )}
            </div>
            <span
              className={`text-sm leading-relaxed ${step.done ? "text-muted-foreground line-through" : "text-foreground"}`}
            >
              {step.text}
            </span>
          </div>
        ))}
      </div>

      {/* Streaming indicator */}
      {status === "streaming" && (
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <div className="size-2 animate-pulse rounded-full bg-primary" />
          <span>Updating plan...</span>
        </div>
      )}
    </div>
  );
}

export const planArtifact = new Artifact<"plan">({
  kind: "plan",
  description:
    "Structured planning document for tracking multi-step agent tasks.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-planDelta") {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + streamPart.data,
          isVisible:
            draftArtifact.status === "streaming" &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: "streaming",
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="plan" />;
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView newContent={newContent} oldContent={oldContent} />;
    }

    // Try structured rendering first
    const structured = <PlanRenderer content={content} status={status} />;
    if (structured.props.content && parsePlanSteps(content)) {
      return structured;
    }

    // Fallback to plain text editor
    return (
      <div className="flex flex-row px-4 py-8 md:p-20">
        <Editor
          content={content}
          currentVersionIndex={currentVersionIndex}
          isCurrentVersion={isCurrentVersion}
          onSaveContent={onSaveContent}
          status={status}
          suggestions={[]}
        />
      </div>
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      label: ".md",
      description: "Download as Markdown",
      onClick: async ({ content }) => {
        const { exportAsMarkdown } = await import("@/lib/export-utils");
        exportAsMarkdown(content, "plan");
        toast.success("Downloaded as Markdown!");
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: "Refine plan",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please review and refine this plan. Suggest improvements, missing steps, or better ordering.",
            },
          ],
        });
      },
    },
  ],
});
