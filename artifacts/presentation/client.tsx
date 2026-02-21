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

const SLIDE_THEMES: Record<
  string,
  { bg: string; color: string; headingColor: string; accentColor: string }
> = {
  default: {
    bg: "#ffffff",
    color: "#1a1a2e",
    headingColor: "#16213e",
    accentColor: "#4A90D9",
  },
  dark: {
    bg: "#1a1a2e",
    color: "#e8e8e8",
    headingColor: "#ffffff",
    accentColor: "#7c83ff",
  },
  corporate: {
    bg: "#f8f9fa",
    color: "#2c3e50",
    headingColor: "#1a252f",
    accentColor: "#2980b9",
  },
  creative: {
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    headingColor: "#ffffff",
    accentColor: "#ffd700",
  },
  minimal: {
    bg: "#fafafa",
    color: "#333333",
    headingColor: "#111111",
    accentColor: "#ff6b6b",
  },
};

type SlideDirectives = {
  theme?: string;
  bg?: string;
  color?: string;
  align?: string;
};

type Slide = {
  content: string;
  directives: SlideDirectives;
};

function parseSlideDirectives(content: string): {
  directives: SlideDirectives;
  cleanContent: string;
} {
  const directives: SlideDirectives = {};
  let clean = content;
  const directiveRegex = /<!--\s*(theme|bg|color|align)\s*:\s*(.+?)\s*-->/gi;
  let match = directiveRegex.exec(content);
  while (match !== null) {
    const key = match[1].toLowerCase() as keyof SlideDirectives;
    directives[key] = match[2].trim();
    clean = clean.replace(match[0], "");
    match = directiveRegex.exec(content);
  }
  return { directives, cleanContent: clean.trim() };
}

function parseSlides(content: string): Slide[] {
  return content
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      const { directives, cleanContent } = parseSlideDirectives(raw);
      return { content: cleanContent, directives };
    });
}

function getSlideStyles(directives: SlideDirectives): {
  containerStyle: React.CSSProperties;
  headingColor: string;
  accentColor: string;
} {
  const themeName = directives.theme || "default";
  const theme = SLIDE_THEMES[themeName] || SLIDE_THEMES.default;

  const bg = directives.bg || theme.bg;
  const color = directives.color || theme.color;
  const isGradient = bg.includes("gradient");

  return {
    containerStyle: {
      ...(isGradient ? { backgroundImage: bg } : { backgroundColor: bg }),
      color,
    },
    headingColor: directives.color || theme.headingColor,
    accentColor: theme.accentColor,
  };
}

function renderMarkdownToHtml(
  md: string,
  headingColor: string,
  accentColor: string
): string {
  let html = md;

  // Code blocks (``` ... ```) — must be processed before inline code
  html = html.replace(
    /```(?:\w+)?\n([\s\S]*?)```/g,
    (_match, code: string) =>
      `<pre style="background:rgba(0,0,0,0.15);border-radius:8px;padding:12px 16px;font-size:0.8em;text-align:left;overflow-x:auto;margin:10px 0;font-family:'Fira Code',Consolas,monospace;"><code>${code.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
  );

  // Tables
  html = html.replace(/((?:^\|.+\|\s*$\n?)+)/gm, (tableBlock: string) => {
    const rows = tableBlock.trim().split("\n").filter(Boolean);
    if (rows.length < 2) {
      return tableBlock;
    }
    const headerCells = rows[0]
      .split("|")
      .filter((c) => c.trim())
      .map((c) => c.trim());
    const isSeparator = (row: string) => /^[\s|:-]+$/.test(row);
    const dataRows = rows.slice(isSeparator(rows[1]) ? 2 : 1);
    let table = `<table style="border-collapse:collapse;margin:12px auto;font-size:0.85em;min-width:60%;">`;
    table += "<thead><tr>";
    for (const cell of headerCells) {
      table += `<th style="border:1px solid rgba(128,128,128,0.3);padding:8px 14px;background:rgba(0,0,0,0.08);font-weight:600;text-align:left;">${cell}</th>`;
    }
    table += "</tr></thead><tbody>";
    for (const row of dataRows) {
      const cells = row
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      table += "<tr>";
      for (const cell of cells) {
        table += `<td style="border:1px solid rgba(128,128,128,0.2);padding:6px 14px;">${cell}</td>`;
      }
      table += "</tr>";
    }
    table += "</tbody></table>";
    return table;
  });

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:80%;max-height:280px;border-radius:8px;margin:12px auto;display:block;object-fit:contain;" />'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener" style="color:${accentColor};text-decoration:underline;">$1</a>`
  );

  // Horizontal rules
  html = html.replace(
    /^(\*{3,}|_{3,})$/gm,
    '<hr style="border:none;border-top:2px solid rgba(128,128,128,0.3);margin:16px 0;" />'
  );

  // Headings
  html = html.replace(
    /^### (.+)$/gm,
    `<h3 style="margin:8px 0;font-size:1.15em;color:${headingColor};font-weight:600;">$1</h3>`
  );
  html = html.replace(
    /^## (.+)$/gm,
    `<h2 style="margin:14px 0;font-size:1.5em;color:${headingColor};font-weight:700;">$1</h2>`
  );
  html = html.replace(
    /^# (.+)$/gm,
    `<h1 style="margin:18px 0;font-size:2em;color:${headingColor};font-weight:800;letter-spacing:-0.02em;">$1</h1>`
  );

  // Bold/Italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code (after code blocks)
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background:rgba(0,0,0,0.1);padding:2px 6px;border-radius:4px;font-size:0.88em;font-family:Consolas,monospace;">$1</code>'
  );

  // Unordered lists
  html = html.replace(
    /^- (.+)$/gm,
    '<li style="margin:5px 0;line-height:1.5;">$1</li>'
  );
  html = html.replace(
    /(<li[^>]*>.*<\/li>\n?)+/g,
    '<ul style="padding-left:28px;margin:10px 0;text-align:left;">$&</ul>'
  );

  // Ordered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li style="margin:5px 0;line-height:1.5;">$1</li>'
  );

  // Blockquotes
  html = html.replace(
    /^> (.+)$/gm,
    `<blockquote style="border-left:3px solid ${accentColor};padding:8px 16px;margin:12px 0;font-style:italic;font-size:0.9em;background:rgba(0,0,0,0.05);border-radius:0 6px 6px 0;">$1</blockquote>`
  );

  // Paragraphs / line breaks
  html = html.replace(/\n\n/g, "<br/>");

  return html;
}

type PresentationMetadata = {
  currentSlide: number;
};

function getSlideTitle(content: string): string {
  const match = content.match(/^#{1,3}\s+(.+)$/m);
  if (match) {
    const title = match[1].trim();
    return title.length > 20 ? `${title.slice(0, 18)}...` : title;
  }
  const firstLine = content.split("\n").find((l) => l.trim().length > 0);
  if (firstLine) {
    const clean = firstLine.replace(/[#*_>-]/g, "").trim();
    return clean.length > 20 ? `${clean.slice(0, 18)}...` : clean;
  }
  return "Slide";
}

function getThumbBg(directives: SlideDirectives): string {
  const themeName = directives.theme || "default";
  const theme = SLIDE_THEMES[themeName] || SLIDE_THEMES.default;
  const bg = directives.bg || theme.bg;
  if (bg.includes("gradient")) {
    return bg;
  }
  return bg;
}

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
  const { containerStyle, headingColor, accentColor } = getSlideStyles(
    slide.directives
  );
  const slideHtml = renderMarkdownToHtml(
    slide.content,
    headingColor,
    accentColor
  );

  const hasTitle = slide.content.match(/^#[^#]/m);
  const alignStyle: React.CSSProperties = {
    textAlign:
      slide.directives.align === "left"
        ? "left"
        : slide.directives.align === "center" || hasTitle
          ? "center"
          : "left",
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Slide area */}
      <div
        className="relative mx-auto flex w-full max-w-[800px] items-center justify-center overflow-hidden rounded-lg border shadow-sm"
        style={{
          aspectRatio: "16/9",
          minHeight: "300px",
          ...containerStyle,
        }}
      >
        <div
          className="flex h-full w-full flex-col items-center justify-center p-10"
          dangerouslySetInnerHTML={{ __html: slideHtml }}
          style={alignStyle}
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
        {slides.map((s, i) => {
          const thumbBg = getThumbBg(s.directives);
          const isGrad = thumbBg.includes("gradient");
          const thumbStyle: React.CSSProperties = isGrad
            ? { backgroundImage: thumbBg }
            : { backgroundColor: thumbBg };
          const isDark =
            s.directives.theme === "dark" ||
            s.directives.theme === "creative" ||
            (s.directives.bg && !s.directives.bg.includes("#f"));
          return (
            <button
              className={`flex h-14 w-24 shrink-0 flex-col items-center justify-center rounded border p-1 transition-colors ${
                i === slideIdx
                  ? "border-primary ring-1 ring-primary"
                  : "border-muted hover:border-foreground/30"
              }`}
              key={`thumb-${i}-${slides.length}`}
              onClick={() => setMetadata({ currentSlide: i })}
              style={thumbStyle}
              title={getSlideTitle(s.content)}
              type="button"
            >
              <span
                className="truncate text-[7px] font-medium leading-tight"
                style={{ color: isDark ? "#e8e8e8" : "#333" }}
              >
                {getSlideTitle(s.content)}
              </span>
              <span
                className="text-[6px] opacity-60"
                style={{ color: isDark ? "#ccc" : "#666" }}
              >
                {i + 1}
              </span>
            </button>
          );
        })}
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
