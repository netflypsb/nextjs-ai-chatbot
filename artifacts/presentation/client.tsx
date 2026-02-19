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

type Slide = {
  content: string;
};

function parseSlides(content: string): Slide[] {
  return content
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((content) => ({ content }));
}

function renderMarkdownToHtml(md: string): string {
  let html = md;
  // Headings
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 style="margin:8px 0;font-size:1.1em;">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 style="margin:12px 0;font-size:1.4em;">$1</h2>'
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 style="margin:16px 0;font-size:1.8em;">$1</h1>'
  );
  // Bold/Italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin:4px 0;">$1</li>');
  html = html.replace(
    /(<li[^>]*>.*<\/li>\n?)+/g,
    '<ul style="padding-left:24px;margin:8px 0;">$&</ul>'
  );
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;">$1</li>');
  // Blockquotes (speaker notes)
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote style="border-left:3px solid #666;padding-left:12px;color:#888;font-style:italic;margin:8px 0;font-size:0.85em;">$1</blockquote>'
  );
  // Line breaks
  html = html.replace(/\n\n/g, "<br/>");
  return html;
}

type PresentationMetadata = {
  currentSlide: number;
};

function SlideRenderer({
  content,
  status,
  metadata,
  setMetadata,
}: {
  content: string;
  status: "streaming" | "idle";
  metadata: PresentationMetadata | null;
  setMetadata: (m: PresentationMetadata) => void;
}) {
  const slides = useMemo(() => parseSlides(content), [content]);
  const currentSlide = metadata?.currentSlide ?? 0;
  const totalSlides = slides.length;

  if (totalSlides === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
        {status === "streaming" ? "Creating slides..." : "No slides found"}
      </div>
    );
  }

  const slideIdx = Math.min(currentSlide, totalSlides - 1);
  const slide = slides[slideIdx];
  const slideHtml = renderMarkdownToHtml(slide.content);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Slide area */}
      <div
        className="relative mx-auto flex w-full max-w-[800px] items-center justify-center overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-zinc-900"
        style={{ aspectRatio: "16/9", minHeight: "300px" }}
      >
        <div
          className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: slide rendering
          dangerouslySetInnerHTML={{ __html: slideHtml }}
        />
        {status === "streaming" && (
          <div className="absolute right-3 bottom-3">
            <div className="size-2 animate-pulse rounded-full bg-primary" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-30"
          disabled={slideIdx === 0}
          onClick={() => setMetadata({ currentSlide: slideIdx - 1 })}
          type="button"
        >
          ← Previous
        </button>
        <span className="text-muted-foreground text-sm">
          {slideIdx + 1} / {totalSlides}
        </span>
        <button
          className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-30"
          disabled={slideIdx >= totalSlides - 1}
          onClick={() => setMetadata({ currentSlide: slideIdx + 1 })}
          type="button"
        >
          Next →
        </button>
      </div>

      {/* Slide thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((_s, i) => (
          <button
            className={`flex h-12 w-20 shrink-0 items-center justify-center rounded border p-1 text-[6px] leading-tight transition-colors ${
              i === slideIdx
                ? "border-primary bg-primary/10"
                : "border-muted hover:border-foreground/30"
            }`}
            key={`thumb-${i}-${slides.length}`}
            onClick={() => setMetadata({ currentSlide: i })}
            title={`Slide ${i + 1}`}
            type="button"
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export const presentationArtifact = new Artifact<
  "presentation",
  PresentationMetadata
>({
  kind: "presentation",
  description:
    "Slide presentations using Markdown with --- separators. Rendered as navigable slides.",
  initialize: ({ setMetadata }) => {
    setMetadata({ currentSlide: 0 });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-presentationDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 200 &&
          draftArtifact.content.length < 220
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
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
    metadata,
    setMetadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);
      return <DiffView newContent={newContent} oldContent={oldContent} />;
    }

    // If content has slide separators, render as slides
    if (content.includes("---")) {
      return (
        <SlideRenderer
          content={content}
          metadata={metadata}
          setMetadata={setMetadata}
          status={status}
        />
      );
    }

    // Fallback to text editor
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
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
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
      label: ".pptx",
      description: "Download as PowerPoint",
      onClick: async ({ content }) => {
        const { exportAsPptx } = await import("@/lib/export-utils");
        await exportAsPptx(content, "presentation");
        toast.success("Downloaded as PowerPoint!");
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      label: ".html",
      description: "Download as HTML",
      onClick: async ({ content }) => {
        const { exportAsHtml } = await import("@/lib/export-utils");
        exportAsHtml(content, "presentation");
        toast.success("Downloaded as HTML!");
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: "Refine slides",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please refine these slides. Improve the content, add more detail where needed, and ensure good visual flow.",
            },
          ],
        });
      },
    },
  ],
});
