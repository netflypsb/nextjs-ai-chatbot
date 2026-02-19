# Solaris Web Phase 2 - Implementation Plan

## Research Findings

### AI SDK UI Capabilities (from ai-sdk.dev docs)
- **Tool call streaming**: Enabled by default. Tool parts have typed names `tool-${toolName}` with states: `input-streaming`, `input-available`, `output-available`, `output-error`
- **Step start parts**: `step-start` parts mark boundaries between multi-step tool calls
- **Custom data streaming**: `writer.write({ type: 'data-<name>', data: ... })` for custom stream events
- **Generative UI**: Tool results can be rendered as any React component via typed tool parts
- **Current gap**: Only `tool-getWeather`, `tool-createDocument`, `tool-updateDocument`, `tool-requestSuggestions` are rendered. All other tools (browseWeb, webSearch, executeCode, searchDocuments, listDocuments, readDocument, createPlan, updatePlan, readPlan) return `null` in the message renderer.

### Interactive Code Execution (Qwen/v0-style)
- Platforms like chat.qwen.ai, v0.dev, bolt.new use **sandboxed iframes** with `srcdoc` to render live HTML/CSS/JS/React
- The AI generates complete HTML (with inline CSS/JS or React via CDN like esm.sh)
- Content is injected via `<iframe srcdoc="..." sandbox="allow-scripts allow-modals">`
- **100% client-side, zero server cost, Vercel-compatible**
- Can support: interactive dashboards, data visualizations, mini web apps, presentations

### Current Artifact System Architecture
- `Artifact` class in `components/create-artifact.tsx` with: `kind`, `description`, `content` (React component), `actions`, `toolbar`, `onStreamPart`, `initialize`
- Content stored as text in PostgreSQL `Document` table
- Each artifact type has `artifacts/{kind}/client.tsx` and `artifacts/{kind}/server.ts`
- Current kinds: `text`, `code`, `sheet`, `image`, `plan`
- Adding new kinds requires: client.tsx, server.ts, register in `artifact.tsx` and `server.ts`, add streaming delta type

### Export Strategy (Client-Side, No Server Dependencies)
- **PowerPoint**: `pptxgenjs` (generates .pptx from JS objects)
- **Word**: `docx` npm package (generates .docx from JS)
- **Excel**: Already have `sheet` type with CSV; can use `xlsx`/SheetJS for .xlsx export
- **PDF**: `html2canvas` + `jsPDF` or `@react-pdf/renderer`
- **Images**: `html-to-image` for PNG/JPG export from DOM elements

---

## Phase 2B: Stream Tool Calls to UI
**Goal**: Show real-time tool execution status for ALL tools in the chat.

**Changes**:
- `components/message.tsx`: Add rendering for all unhandled tool types using a generic `ToolCallRenderer` pattern
- Show tool name, streaming inputs, outputs with appropriate icons
- Specifically render: `tool-browseWeb`, `tool-webSearch`, `tool-executeCode`, `tool-searchDocuments`, `tool-listDocuments`, `tool-readDocument`, `tool-createPlan`, `tool-updatePlan`, `tool-readPlan`

**Files**: `components/message.tsx`

---

## Phase 2C: Enhanced Plan Artifact
**Goal**: Interactive plan rendering with checkboxes, progress bar, status badges.

**Changes**:
- Parse plan content as structured JSON (steps with status)
- Render with interactive checkboxes, progress indicator, step status badges
- Smooth animations on status changes
- Keep backward compatibility with plain text plans

**Files**: `artifacts/plan/client.tsx`

---

## Phase 2D: Interactive Code Preview (Qwen-style)
**Goal**: Enable the code artifact to render live HTML/CSS/JS/React in a sandboxed iframe.

**Changes**:
- Add "Preview" tab to code artifact alongside the code editor
- Detect language: Python (existing behavior) vs HTML/JS/TS/React
- For web code: render in sandboxed iframe via `srcdoc`
- Support React via CDN (esm.sh + Babel standalone for JSX)
- Add toggle between "Code" and "Preview" views

**Files**: `artifacts/code/client.tsx`, new `components/code-preview.tsx`

---

## Phase 2E: New Document Types
**Goal**: Add `presentation` and `webview` artifact kinds.

### Presentation (Reveal.js Markdown)
- Content format: Markdown with `---` slide separators
- Rendered in iframe using Reveal.js CDN
- Agent generates structured slide markdown
- Export: convert to PPTX via `pptxgenjs`

### Webview (Interactive HTML/SVG)
- Content format: Full HTML document
- For: banners, posters, infographics, dashboards, interactive content
- Rendered in sandboxed iframe
- Export: PNG/JPG via `html-to-image`, PDF via `jsPDF`

**Files**: 
- `artifacts/presentation/client.tsx`, `artifacts/presentation/server.ts`
- `artifacts/webview/client.tsx`, `artifacts/webview/server.ts`
- Update `components/artifact.tsx`, `lib/artifacts/server.ts`, `lib/db/schema.ts`, `lib/types.ts`

---

## Phase 2F: Client-Side Export/Download
**Goal**: Add download buttons to artifact actions for each type.

**Dependencies to install**: `pptxgenjs`, `docx`, `html-to-image`, `jspdf`

**Export mapping**:
- `text` → .md, .txt
- `code` → .py, .html, .js, .ts
- `sheet` → .csv, .xlsx
- `plan` → .md
- `presentation` → .pptx, .pdf
- `webview` → .html, .png, .pdf

**Files**: Each artifact's `client.tsx` actions array, new `lib/export-utils.ts`

---

## Phase 2G: Update Prompts & Register Types
**Goal**: Agent knows about new artifact types and when to use them.

**Changes**:
- Update `lib/ai/prompts.ts` with descriptions for new types
- Update `lib/db/schema.ts` document kind enum
- Register new artifact definitions
- Update `lib/types.ts` with new delta types

---

## Implementation Order
1. **2B** - Tool call streaming (foundation for UX)
2. **2C** - Enhanced plan rendering
3. **2D** - Interactive code preview
4. **2E** - New document types (presentation, webview)
5. **2F** - Export/download capabilities
6. **2G** - Prompts and registration (done incrementally with each phase)
7. **Build & test**
