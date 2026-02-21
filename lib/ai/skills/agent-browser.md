# Agent Browser Specialist

## Overview
agent-browser is an AI-optimized browser automation tool using Playwright. It uses a ref-based snapshot system for deterministic element selection, producing compact text output to minimize token usage.

## Available Tools
- `agentBrowserNavigate` — Navigate to URL, returns accessibility snapshot with element refs (@e1, @e2, etc.)
- `agentBrowserInteract` — Click, fill, type, hover, check/uncheck elements using refs
- `agentBrowserExtract` — Extract text/html/value/snapshot from page or elements
- `agentBrowserClose` — Close browser session and free resources

## Core Workflow
1. **Navigate**: `agentBrowserNavigate({ url })` → get snapshot with @refs
2. **Analyze snapshot**: Read the accessibility tree, identify target elements by @ref
3. **Interact**: `agentBrowserInteract({ action, ref, value })` → returns updated snapshot
4. **Extract if needed**: `agentBrowserExtract({ ref, extractType })` → content
5. **Always close**: `agentBrowserClose()` when done — this is mandatory

## The Ref System
- Snapshots assign unique refs like `@e1`, `@e2` to interactive elements
- Refs are **INVALIDATED** after any page change (navigation, form submit, dynamic update)
- **ALWAYS re-snapshot** after interactions that change the page
- Use refs from the **MOST RECENT snapshot only** — never reuse old refs
- The snapshot is an accessibility tree: compact, deterministic, AI-friendly

## Search Engine Usage (replacing webSearch)
To search the web using agent-browser:
1. Navigate directly to a search URL:
   - Google: `agentBrowserNavigate({ url: "https://www.google.com/search?q=YOUR+QUERY" })`
   - DuckDuckGo: `agentBrowserNavigate({ url: "https://duckduckgo.com/?q=YOUR+QUERY" })`
   - Bing: `agentBrowserNavigate({ url: "https://www.bing.com/search?q=YOUR+QUERY" })`
2. Parse the snapshot for search result links (look for link refs)
3. Navigate to promising results or use `browseWeb` for faster content extraction
4. Extract text from pages using `agentBrowserExtract({ extractType: "text" })`

**Tip**: URL-encode your search query. Replace spaces with `+` or `%20`.

## Interaction Actions
| Action | Description | Requires `value` |
|--------|-------------|:---:|
| `click` | Click an element | No |
| `fill` | Clear field, then type text | Yes |
| `type` | Type text without clearing | Yes |
| `hover` | Hover over element | No |
| `check` | Check a checkbox | No |
| `uncheck` | Uncheck a checkbox | No |

## Best Practices
- **Always close sessions** when done — browser resources are limited
- Use `extractType: "text"` for reading page content (fewer tokens than HTML)
- Use `extractType: "snapshot"` to re-assess interactive page state
- For forms: use `fill` (clears then types) not `type` (appends to existing)
- If an interaction fails, take a new snapshot and retry with fresh refs
- For multi-page research: navigate → extract text → navigate next → extract → close

## Common Patterns

### Read an article at a URL
1. `agentBrowserNavigate({ url })` → snapshot
2. `agentBrowserExtract({ extractType: "text" })` → full text
3. `agentBrowserClose()`

### Fill and submit a form
1. `agentBrowserNavigate({ url })` → snapshot with form field refs
2. `agentBrowserInteract({ action: "fill", ref: "@e3", value: "John" })` → updated snapshot
3. `agentBrowserInteract({ action: "fill", ref: "@e5", value: "john@email.com" })`
4. `agentBrowserInteract({ action: "click", ref: "@e7" })` → submit button
5. Verify result from new snapshot
6. `agentBrowserClose()`

### Multi-page web research
1. `agentBrowserNavigate({ url: "https://www.google.com/search?q=topic" })` → search results
2. Identify result links from snapshot refs
3. `agentBrowserInteract({ action: "click", ref: "@e12" })` → navigate to result
4. `agentBrowserExtract({ extractType: "text" })` → page content
5. Repeat for other results or use `browseWeb` for known URLs
6. `agentBrowserClose()`

## Troubleshooting
- **"Failed to navigate"**: URL may be invalid or site blocks automation — try a different URL
- **"Failed to click"**: Ref is stale — take new snapshot with `agentBrowserExtract({ extractType: "snapshot" })`
- **Truncated content**: Use `agentBrowserExtract` with specific `ref` for targeted extraction
- **Page not loading**: Some sites require JavaScript — agent-browser handles this automatically
- **CAPTCHA/blocked**: Try a different search engine or use `browseWeb` as fallback
