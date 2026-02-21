# Phase 5E — Tool Search / Discovery System

## Objective
Implement a custom tool-search pattern inspired by Anthropic's `tool_search_tool`. Since Solaris uses OpenRouter (not direct Anthropic API) and Vercel AI SDK requires all tools registered upfront, we implement a **prompt-level tool hiding** approach with a `searchTools` discovery tool.

## Design

### Why Custom Implementation?
- Anthropic's native `tool_search_tool` is an API-level feature (requires direct Anthropic API with beta headers)
- Solaris uses OpenRouter → no access to native tool search
- Vercel AI SDK's `streamText()` requires all tools in the `tools` object at call time → can't truly defer tool registration
- **Solution**: All tools remain registered, but the system prompt only describes "core" tools. Non-core tools are discoverable via a `searchTools` tool.

### How It Works
1. **All tools remain registered** with `streamText()` (SDK requirement — the agent CAN use any tool)
2. **System prompt describes only core tools** in detail (~800 tokens saved)
3. **Non-core tools listed as a brief catalog** in the prompt (name + one-line, ~200 tokens)
4. **`searchTools` tool** returns full descriptions, parameters, and usage examples for matching tools
5. **Agent workflow**: Encounters a task → searches for relevant tools → gets full details → uses the tool

### Core vs Non-Core Tools

**Core tools** (always described in system prompt):
| Tool | Reason |
|------|--------|
| createDocument | Fundamental to every task |
| updateDocument | Fundamental to every task |
| readDocument | Fundamental to every task |
| listDocuments | Document management |
| searchDocuments | Document management |
| requestSuggestions | Document management |
| createPlan | Required for ReACT loop |
| updatePlan | Required for ReACT loop |
| readPlan | Required for ReACT loop |
| readSkill | Skill loading (Phase 5B) |
| searchSkills | Skill discovery (Phase 5B) |
| searchTools | Tool discovery (this phase) |

**Non-core tools** (discoverable via searchTools):
| Tool | Category |
|------|----------|
| agentBrowserNavigate | Browser Automation |
| agentBrowserInteract | Browser Automation |
| agentBrowserExtract | Browser Automation |
| agentBrowserClose | Browser Automation |
| browseWeb | Web Content |
| executeCode | Code Execution |
| getWeather | Utility |

## Implementation

### New Tool: `searchTools` (`lib/ai/tools/search-tools.ts`)

```ts
import { tool } from "ai";
import { z } from "zod";

// Full tool catalog with descriptions and usage
const TOOL_CATALOG = [
  {
    name: "agentBrowserNavigate",
    category: "Browser Automation",
    description: "Navigate to a URL using the AI browser. Returns an accessibility snapshot with interactive element references (@e1, @e2). Use for: web browsing, search engine queries, reading dynamic pages.",
    parameters: "url (string, required): The URL to navigate to",
    usage: "agentBrowserNavigate({ url: 'https://google.com/search?q=query' })",
    relatedSkill: "agent-browser",
  },
  {
    name: "agentBrowserInteract",
    category: "Browser Automation",
    description: "Interact with elements on the current browser page using refs from a snapshot. Supports click, fill, type, hover, check, uncheck. Returns updated snapshot after interaction.",
    parameters: "action (enum: click|fill|type|hover|check|uncheck), ref (string: element ref like '@e1'), value (string, optional: text for fill/type)",
    usage: "agentBrowserInteract({ action: 'click', ref: '@e3' })",
    relatedSkill: "agent-browser",
  },
  {
    name: "agentBrowserExtract",
    category: "Browser Automation",
    description: "Extract content from the current browser page or specific element. Returns text, HTML, input value, or accessibility snapshot.",
    parameters: "ref (string, optional: element ref), extractType (enum: text|html|value|snapshot, default: text)",
    usage: "agentBrowserExtract({ extractType: 'text' })",
    relatedSkill: "agent-browser",
  },
  {
    name: "agentBrowserClose",
    category: "Browser Automation",
    description: "Close the current browser session and free resources. Always call when done with browser automation.",
    parameters: "none",
    usage: "agentBrowserClose()",
    relatedSkill: "agent-browser",
  },
  {
    name: "browseWeb",
    category: "Web Content",
    description: "Browse a URL and extract its text content using Browserbase cloud browser. Returns up to 15,000 chars of readable text. Use for reading articles, docs, known URLs. Simpler than agent-browser.",
    parameters: "url (string, required): The URL to browse",
    usage: "browseWeb({ url: 'https://docs.example.com/api' })",
    relatedSkill: "browserbase",
  },
  {
    name: "executeCode",
    category: "Code Execution",
    description: "Execute Python code in a secure E2B sandbox with internet access. Supports pip package installation. Can generate downloadable files (PPTX, DOCX, XLSX, PDF). Returns stdout, stderr, generated files as base64, and chart images.",
    parameters: "code (string, required): Python code to execute. installPackages (string[], optional): pip packages to install first.",
    usage: "executeCode({ code: 'print(2+2)', installPackages: ['pandas'] })",
    relatedSkill: null,
  },
  {
    name: "getWeather",
    category: "Utility",
    description: "Get current weather information for a location. Returns temperature, conditions, humidity, wind. Requires user approval before execution.",
    parameters: "city (string, optional), latitude/longitude (numbers, optional)",
    usage: "getWeather({ city: 'San Francisco' })",
    relatedSkill: null,
  },
];

export const searchTools = tool({
  description:
    "Search for available tools by name, category, or capability. Returns full descriptions, parameters, and usage examples for matching tools. Use this to discover tools for tasks like web browsing, code execution, or other capabilities not described in your core instructions.",
  inputSchema: z.object({
    query: z.string().describe("Search query (e.g. 'browser', 'code execution', 'weather', 'web')"),
  }),
  execute: async ({ query }) => {
    const q = query.toLowerCase();
    const results = TOOL_CATALOG.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );

    if (results.length === 0) {
      return {
        query,
        results: [],
        allCategories: [...new Set(TOOL_CATALOG.map((t) => t.category))],
        message: "No matching tools found. Try searching by category.",
      };
    }

    return {
      query,
      results: results.map((t) => ({
        name: t.name,
        category: t.category,
        description: t.description,
        parameters: t.parameters,
        usage: t.usage,
        relatedSkill: t.relatedSkill
          ? `Load skill '${t.relatedSkill}' with readSkill for expert guidance`
          : null,
      })),
    };
  },
});
```

## Files to Create
1. `lib/ai/tools/search-tools.ts` — searchTools tool with full tool catalog

## Files to Modify

### 1. `app/(chat)/api/chat/route.ts`
- Import `searchTools` from `@/lib/ai/tools/search-tools`
- Add to `tools` object: `searchTools,`
- Add to `experimental_activeTools` array: `"searchTools",`

### 2. `lib/types.ts`
- Add searchTools type import and ChatTools entry

### 3. `hooks/use-tool-settings.ts`
- Add searchTools to the "Skills" category (or create a "Discovery" category):
  ```ts
  {
    id: "discovery",
    name: "Discovery Tools",
    description: "Search for tools and skills to enhance agent capabilities",
    tools: ["searchTools", "searchSkills", "readSkill"],
  },
  ```
- Note: Discovery tools should always be enabled (core tools)

## Integration with System Prompt (Phase 5F)

The system prompt will include:
```
## Non-Core Tools (use searchTools to discover)
The following tools are available but not described here. Use `searchTools` to get full details:
- **Browser Automation**: agentBrowserNavigate, agentBrowserInteract, agentBrowserExtract, agentBrowserClose
- **Web Content**: browseWeb
- **Code Execution**: executeCode
- **Utility**: getWeather

When you need any of these tools, FIRST use `searchTools` to get usage details, THEN optionally `readSkill` for expert guidance.
```

## Token Savings Analysis

### Before (current system prompt tool section)
- Full descriptions for all 16 tools in prompt: ~1,500 tokens

### After
- Core tool descriptions (12 tools): ~800 tokens
- Non-core tool catalog (7 tools, names only): ~150 tokens
- Skill metadata (5 skills): ~400 tokens
- **Total in prompt**: ~1,350 tokens
- **On-demand**: searchTools result ~200 tokens, skill content ~2-4k tokens

The savings are modest for 16 tools but the architecture scales: if Solaris adds 50+ tools, only core tools stay in the prompt.

## Verification
- `searchTools({ query: "browser" })` returns all 4 agent-browser tools + browseWeb
- `searchTools({ query: "code" })` returns executeCode
- `searchTools({ query: "weather" })` returns getWeather
- Agent can still use non-core tools directly (they're registered)
- `next build` passes
