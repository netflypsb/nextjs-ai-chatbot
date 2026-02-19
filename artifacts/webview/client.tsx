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

type WebviewMetadata = {
  showSource: boolean;
};

function SourceIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export const webviewArtifact = new Artifact<"webview", WebviewMetadata>({
  kind: "webview",
  description:
    "Interactive HTML content: banners, posters, infographics, dashboards. Rendered in a sandboxed iframe.",
  initialize: ({ setMetadata }) => {
    setMetadata({ showSource: false });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-webviewDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 300 &&
          draftArtifact.content.length < 320
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
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);
      return <DiffView newContent={newContent} oldContent={oldContent} />;
    }

    const showSource = metadata?.showSource ?? false;

    if (showSource) {
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
    }

    return (
      <div className="relative h-[600px] w-full">
        {status === "streaming" && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
            <div className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-muted-foreground">Rendering...</span>
          </div>
        )}
        <iframe
          className="h-full w-full border-0 bg-white"
          sandbox="allow-scripts allow-modals allow-popups allow-same-origin"
          srcDoc={content}
          title="Webview Preview"
        />
      </div>
    );
  },
  actions: [
    {
      icon: <SourceIcon size={18} />,
      label: "Source",
      description: "Toggle source code view",
      onClick: ({ metadata, setMetadata }) => {
        setMetadata({
          ...metadata,
          showSource: !metadata.showSource,
        });
      },
    },
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
      description: "Copy HTML to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied HTML to clipboard!");
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      label: ".html",
      description: "Download as HTML",
      onClick: async ({ content }) => {
        const { exportAsHtml } = await import("@/lib/export-utils");
        exportAsHtml(content, "design");
        toast.success("Downloaded as HTML!");
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      label: ".png",
      description: "Download as PNG image",
      onClick: async ({ content }) => {
        const { exportAsPng } = await import("@/lib/export-utils");
        await exportAsPng(content, "design");
        toast.success("Downloaded as PNG!");
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      label: ".pdf",
      description: "Download as PDF",
      onClick: async ({ content }) => {
        const { exportAsPdf } = await import("@/lib/export-utils");
        await exportAsPdf(content, "design");
        toast.success("Downloaded as PDF!");
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: "Refine design",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please refine this design. Improve the visual aesthetics, add more polish, and ensure responsive layout.",
            },
          ],
        });
      },
    },
  ],
});
