# Phase 5A — Delete Web Search Tool

## Objective
Remove the non-functional `webSearch` tool (Brave Search API key not provided, DuckDuckGo fallback unreliable). The agent will use agent-browser and browserbase tools for web search instead, guided by skills.

## Files to Modify

### 1. Delete `lib/ai/tools/web-search.ts`
- Remove the entire file

### 2. Update `app/(chat)/api/chat/route.ts`
- **Remove import**: `import { webSearch } from "@/lib/ai/tools/web-search";`
- **Remove from `tools` object**: `webSearch,`
- **Remove from `experimental_activeTools` array**: `"webSearch",`

### 3. Update `lib/types.ts` (if webSearch is referenced)
- Check and remove any webSearch type references

### 4. Update `hooks/use-tool-settings.ts`
- Remove the `webSearch` category entirely:
  ```ts
  {
    id: "webSearch",
    name: "Web Search",
    description: "Search the internet using Brave Search / DuckDuckGo",
    tools: ["webSearch"],
  },
  ```

### 5. Update `lib/ai/prompts.ts`
- Remove from `deepAgentPrompt`:
  ```
  - `webSearch`: Search the internet for current information...
  ```
- Remove rule: `"When you need current information, ALWAYS use webSearch first"`
- These will be fully reworked in Phase 5F, but delete the webSearch references now

### 6. Update `app/(chat)/api/chat/schema.ts`
- If `webSearch` is hardcoded in any schema validation, remove it

## Verification
- `next build` passes
- No references to `webSearch` or `web-search` remain in source (except phase docs)
- No references to `BRAVE_SEARCH_API_KEY` remain in source
