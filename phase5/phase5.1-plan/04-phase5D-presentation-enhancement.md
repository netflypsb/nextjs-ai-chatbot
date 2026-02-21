# Phase 5D — Presentation Enhancement

## Objective
Transform the basic presentation renderer into a rich, themeable slide system with image support, gradient backgrounds, better typography, and visual hierarchy. Make presentations created by Solaris visually compelling and properly formatted for both rendering and PPTX download.

## Current State Analysis

### `artifacts/presentation/client.tsx`
- `renderMarkdownToHtml()` — basic regex markdown→HTML with hardcoded inline styles
- Supports: H1-H3, bold, italic, unordered lists, ordered lists, blockquotes, line breaks
- **Missing**: Images, code blocks, tables, themes, colors, gradients, horizontal rules, links
- Slide area: white bg, centered content, 16:9 aspect ratio
- Thumbnails: just slide numbers, no preview content

### `artifacts/presentation/server.ts`
- System prompt for presentation creation is basic
- No theme/directive instructions
- Uses `smoothStream({ chunking: "word" })` for streaming

### `lib/export-utils.ts`
- `exportAsPptx()` exists using pptxgenjs
- Needs to handle new theme/styling metadata

## Implementation Plan

### Step 1: Enhanced Markdown-to-HTML Renderer

Update `renderMarkdownToHtml()` in `artifacts/presentation/client.tsx`:

**Add support for**:
1. **Images**: `![alt](url)` → `<img src="url" alt="alt" style="max-width:80%;max-height:300px;border-radius:8px;margin:12px auto;display:block;" />`
2. **Links**: `[text](url)` → `<a href="url" target="_blank" style="color:#4A90D9;text-decoration:underline;">text</a>`
3. **Code blocks**: ` ```lang ... ``` ` → `<pre><code>...</code></pre>` with styled background
4. **Inline code**: `` `code` `` → `<code style="background:#f0f0f0;padding:2px 6px;border-radius:3px;font-size:0.9em;">code</code>`
5. **Tables**: `| col | col |` → `<table>` with styled borders and padding
6. **Horizontal rules**: `***` or `___` → `<hr style="border:none;border-top:2px solid #ddd;margin:16px 0;" />`

### Step 2: Theme System

**Theme directive parsing**: Parse HTML comments at the start of each slide:
```
<!-- theme: dark -->
<!-- bg: linear-gradient(135deg, #667eea, #764ba2) -->
<!-- color: #ffffff -->
<!-- align: left -->
```

**Predefined themes**:

```ts
const SLIDE_THEMES: Record<string, { bg: string; color: string; headingColor: string; accentColor: string }> = {
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
```

**Implementation**: 
1. New function `parseSlideDirectives(slideContent: string)` extracts theme/bg/color/align from HTML comments
2. Directives are removed from content before markdown rendering
3. Theme styles applied to the slide container div
4. Custom `bg` and `color` directives override theme defaults

### Step 3: Improved Slide Layout

Update the `SlideRenderer` component:

1. **Dynamic backgrounds**: Apply theme bg to slide container (supports solid colors and CSS gradients)
2. **Text alignment**: Support left/center alignment per slide (default: center for title slides, left for content slides — auto-detect based on content type)
3. **Better typography**: Larger heading sizes, better line-height, proper margins
4. **Content area**: Add padding, max-width constraint for readability
5. **Dark mode aware**: Theme colors work in both light and dark app modes

### Step 4: Enhanced Thumbnails

Update slide thumbnails to show:
- First few words of slide title (not just number)
- Theme background color as thumbnail background
- Active slide highlighted with primary color

### Step 5: Update Server-Side Prompt

Update `artifacts/presentation/server.ts` creation prompt to:
- Include theme directive syntax
- Encourage use of themes for different slide types
- Include image syntax
- Encourage visual variety across slides
- Reference the presentation skill for advanced patterns

### Step 6: PPTX Export Enhancement

Update `exportAsPptx()` in `lib/export-utils.ts`:
- Parse theme directives for slide background colors
- Apply theme colors to PPTX slides
- Handle image URLs in PPTX export (download and embed)
- Better text formatting in exported slides

## Files to Modify

### Primary
1. **`artifacts/presentation/client.tsx`** — Major: enhanced renderer, theme system, layout improvements
2. **`artifacts/presentation/server.ts`** — Moderate: updated creation/update prompts

### Secondary
3. **`lib/export-utils.ts`** — Moderate: PPTX export theme support
4. **`lib/ai/prompts.ts`** — Minor: update presentation description in deepAgentPrompt (done fully in 5F)

## Detailed Changes for `artifacts/presentation/client.tsx`

### New function: `parseSlideDirectives()`
```ts
type SlideDirectives = {
  theme?: string;
  bg?: string;
  color?: string;
  align?: "left" | "center";
};

function parseSlideDirectives(content: string): { directives: SlideDirectives; cleanContent: string } {
  const directives: SlideDirectives = {};
  let clean = content;
  
  const directiveRegex = /<!--\s*(theme|bg|color|align)\s*:\s*(.+?)\s*-->/gi;
  let match;
  while ((match = directiveRegex.exec(content)) !== null) {
    const key = match[1].toLowerCase() as keyof SlideDirectives;
    directives[key] = match[2].trim();
    clean = clean.replace(match[0], "");
  }
  
  return { directives, cleanContent: clean.trim() };
}
```

### Updated `renderMarkdownToHtml()` — add image, link, code, table support
### Updated `SlideRenderer` — apply themes, better layout
### Updated thumbnails — show title text + theme color

## Design Considerations

- **No external dependencies**: All rendering is pure CSS/HTML (no reveal.js, no Marp)
- **Self-contained**: Themes are CSS-in-JS, no external stylesheets needed
- **PPTX compatibility**: Keep markdown simple enough that pptxgenjs can handle export
- **Streaming compatible**: Theme parsing must work during streaming (partial content)
- **Backwards compatible**: Existing presentations without directives render with "default" theme

## Verification
- Create a test presentation with theme directives → renders correctly
- Slides with `<!-- theme: dark -->` show dark background
- Images render within slides
- Code blocks render with syntax styling
- Tables render with proper formatting
- Existing presentations (no directives) still render correctly
- PPTX export includes theme colors
- `next build` passes
