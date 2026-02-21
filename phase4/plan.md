# Phase 4 Implementation Plan — ✅ COMPLETED

## Phase 4A: Enable Thinking Models to Use Tools
**Priority: HIGH | Complexity: LOW**

### Problem
In `route.ts` lines 157-158, `experimental_activeTools` is set to `[]` for reasoning models, which completely disables all tools. This means thinking models like `qwen3-max-thinking` cannot use any tools at all.

### Fix
- Remove the conditional that sets `experimental_activeTools: []` for reasoning models
- Give ALL models the same full tool list
- Keep the `providerOptions` for thinking budget on reasoning models

### Files Modified
- `app/(chat)/api/chat/route.ts`

---

## Phase 4B: Fix browse-web Build Crash + Add agent-browser Tool
**Priority: HIGH | Complexity: MEDIUM**

### Problem 1: Deployment Blocker
`browse-web.ts` creates `new Browserbase()` at module level (line 5), which throws if `BROWSERBASE_API_KEY` env var is missing. This crashes the Vercel build.

### Fix 1
Make Browserbase client creation lazy - only instantiate inside the `execute` function.

### Problem 2: Add agent-browser
The existing `browseWeb` tool uses Browserbase SDK (paid service) with simple fetch fallback. The `agent-browser` package provides superior AI-optimized browser automation with snapshot/ref system.

### Implementation
- Install `agent-browser` package
- Create `lib/ai/tools/agent-browser.ts` with these sub-capabilities:
  - `agentBrowserNavigate` - Navigate to URL and get snapshot
  - `agentBrowserInteract` - Click, fill, type using element refs
  - `agentBrowserExtract` - Get text/HTML content from elements
  - `agentBrowserScreenshot` - Capture page screenshot
- Register tools in route.ts

### Files Modified/Created
- `lib/ai/tools/browse-web.ts` (fix lazy init)
- `lib/ai/tools/agent-browser.ts` (new)
- `app/(chat)/api/chat/route.ts` (register new tools)

---

## Phase 4C: Tool Selection Settings
**Priority: MEDIUM | Complexity: MEDIUM**

### Problem
Multiple web browser tools exist (browseWeb, webSearch, agentBrowser*). Users should choose which ones are active.

### Implementation
- Create a `toolSettings` table in DB or use user preferences (simpler: localStorage + cookie approach)
- Add a Settings page/modal accessible from sidebar user nav
- Tool categories: Web Search, Web Browse, Agent Browser, Code Execution, Weather
- Selected tools are passed to the API via request body
- Route.ts filters `experimental_activeTools` based on user selection
- Default: all tools enabled

### Files Modified/Created
- `components/tool-settings.tsx` (new - settings modal)
- `components/sidebar-user-nav.tsx` (add settings link)
- `app/(chat)/api/chat/route.ts` (filter tools by selection)
- `app/(chat)/api/chat/schema.ts` (add selectedTools to request)
- `components/chat.tsx` (pass tool settings)
- `hooks/use-tool-settings.ts` (new - localStorage hook)

---

## Phase 4D: Create Projects System
**Priority: HIGH | Complexity: HIGH**

### Problem
No project organization. All chats and documents are flat, per-user. Users need to organize work into projects.

### Database Changes
- New `project` table: `id`, `userId`, `name`, `description`, `createdAt`, `updatedAt`
- Add `projectId` column to `chat` table (nullable for backward compat)
- Add `projectId` column to `document` table (nullable for backward compat)
- Migration script to add columns

### API Routes
- `app/api/projects/route.ts` - GET (list), POST (create)
- `app/api/projects/[id]/route.ts` - GET, PATCH, DELETE

### UI Changes
- Project switcher in sidebar header (dropdown above chat list)
- Filter chat history by active project
- "Default Project" for unassigned chats
- New project dialog

### Tool Scoping
- Document management tools (list, search, read) scoped to active project's documents
- Pass `projectId` through session/request to tool factories

### Files Modified/Created
- `lib/db/schema.ts` (add project table, add projectId to chat/document)
- `lib/db/queries.ts` (project CRUD, scoped queries)
- `lib/db/migrations/` (new migration)
- `app/api/projects/route.ts` (new)
- `app/api/projects/[id]/route.ts` (new)
- `components/project-switcher.tsx` (new)
- `components/app-sidebar.tsx` (add project switcher)
- `components/sidebar-history.tsx` (filter by project)
- `hooks/use-active-project.ts` (new)
- `app/(chat)/api/chat/route.ts` (pass projectId to tools)
- `lib/ai/tools/list-documents.ts` (scope to project)
- `lib/ai/tools/search-documents.ts` (scope to project)
- `lib/ai/tools/create-document.ts` (set projectId)

---

## Phase 4E: Fix Artifact Selector
**Priority: MEDIUM | Complexity: LOW**

### Problem
The artifact selector only shows artifacts from the current chat's messages. When the agent creates multiple versions or documents across threads, only some appear. Should show all artifacts in the active project.

### Fix
- Fetch artifacts from DB via API (scoped to active project) instead of extracting from chat messages only
- Combine: project-level artifacts + current chat's in-progress artifacts
- Show version info when multiple versions exist

### Files Modified
- `components/artifact-selector.tsx` (fetch from API + merge with chat)
- `app/api/projects/[id]/artifacts/route.ts` (new - list project artifacts)

---

## Phase 4F: Build Verification & Test
- Run `next build` to verify all changes compile
- Test tool registration with all model types
- Verify project CRUD operations
- Test artifact selector with project scope
