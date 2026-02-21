# Phase 5G — Tool Settings UI Update

## Objective
Update the tool settings UI to reflect Phase 5 changes: removed webSearch, new discovery/skill tools, reorganized categories. Ensure the tool settings correctly controls which tools are active.

## Dependencies
- Phase 5A (webSearch deleted)
- Phase 5B (readSkill, searchSkills added)
- Phase 5E (searchTools added)

## Current State Analysis

### `hooks/use-tool-settings.ts`
- 7 categories: Documents, Plans, Web Search, Web Browse, Agent Browser, Code Execution, Other
- `webSearch` category still listed (tool deleted in 5A)
- No category for discovery tools (searchTools, readSkill, searchSkills)
- All categories toggleable — but core tools should not be disableable

### `components/tool-settings.tsx`
- Simple dialog with toggle switches per category
- No indication of which categories are "core" (always needed)

### `app/(chat)/api/chat/route.ts`
- `experimental_activeTools` filters based on `selectedTools` from client
- If a tool is in `selectedTools`, it's active; otherwise filtered out

## Implementation Plan

### Step 1: Reorganize Tool Categories

New categories in `hooks/use-tool-settings.ts`:

```ts
export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "documents",
    name: "Document Management",
    description: "Create, read, update, search, and list documents",
    tools: ["createDocument", "updateDocument", "readDocument", "listDocuments", "searchDocuments", "requestSuggestions"],
    core: true, // Cannot be disabled
  },
  {
    id: "plans",
    name: "Plan Management",
    description: "Create, read, and update plans for multi-step tasks",
    tools: ["createPlan", "updatePlan", "readPlan"],
    core: true, // Cannot be disabled
  },
  {
    id: "discovery",
    name: "Discovery (Skills & Tools)",
    description: "Search and load skills and discover available tools",
    tools: ["readSkill", "searchSkills", "searchTools"],
    core: true, // Cannot be disabled
  },
  {
    id: "agentBrowser",
    name: "Agent Browser",
    description: "AI-optimized browser with snapshot/ref system for web browsing and interaction",
    tools: ["agentBrowserNavigate", "agentBrowserInteract", "agentBrowserExtract", "agentBrowserClose"],
    core: false,
  },
  {
    id: "browseWeb",
    name: "Browserbase",
    description: "Browse web pages and extract text content using Browserbase cloud browser",
    tools: ["browseWeb"],
    core: false,
  },
  {
    id: "codeExecution",
    name: "Code Execution",
    description: "Execute Python code in a sandboxed environment with file generation",
    tools: ["executeCode"],
    core: false,
  },
  {
    id: "other",
    name: "Utility",
    description: "Weather and other utility tools",
    tools: ["getWeather"],
    core: false,
  },
];
```

**Key changes**:
- Removed `webSearch` category entirely
- Added `discovery` category (core, cannot be disabled)
- Added `core: boolean` field to `ToolCategory` type
- Renamed categories for clarity

### Step 2: Update ToolCategory Type

```ts
export type ToolCategory = {
  id: string;
  name: string;
  description: string;
  tools: string[];
  core?: boolean; // If true, category cannot be disabled
};
```

### Step 3: Update `getActiveTools()`

Core tools are always included regardless of toggle state:

```ts
const getActiveTools = useCallback((): string[] => {
  const active: string[] = [];
  for (const cat of TOOL_CATEGORIES) {
    if (cat.core || categoryEnabled[cat.id] !== false) {
      active.push(...cat.tools);
    }
  }
  return active;
}, [categoryEnabled]);
```

### Step 4: Update Tool Settings UI

In `components/tool-settings.tsx`:
- Core categories shown with a lock icon and disabled toggle (always on)
- Non-core categories have normal toggles
- Add a note: "Core tools cannot be disabled"

```tsx
{TOOL_CATEGORIES.map((cat) => (
  <div className="flex items-center justify-between rounded-lg border p-3" key={cat.id}>
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-sm">{cat.name}</span>
        {cat.core && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Core
          </span>
        )}
      </div>
      <span className="text-muted-foreground text-xs">{cat.description}</span>
    </div>
    {cat.core ? (
      <ToggleSwitch checked={true} onToggle={() => {}} disabled />
    ) : (
      <ToggleSwitch
        checked={categoryEnabled[cat.id] !== false}
        onToggle={() => toggleCategory(cat.id)}
      />
    )}
  </div>
))}
```

### Step 5: Update `experimental_activeTools` in route.ts

Update the `allTools` array to include new tools and remove webSearch:

```ts
experimental_activeTools: (() => {
  const allTools = [
    // Core: Documents
    "createDocument", "updateDocument", "readDocument",
    "listDocuments", "searchDocuments", "requestSuggestions",
    // Core: Plans
    "createPlan", "updatePlan", "readPlan",
    // Core: Discovery
    "readSkill", "searchSkills", "searchTools",
    // Non-core: Browser
    "agentBrowserNavigate", "agentBrowserInteract",
    "agentBrowserExtract", "agentBrowserClose",
    // Non-core: Browserbase
    "browseWeb",
    // Non-core: Code
    "executeCode",
    // Non-core: Utility
    "getWeather",
  ] as const;
  
  if (selectedTools && selectedTools.length > 0) {
    return allTools.filter((t) => selectedTools.includes(t));
  }
  return [...allTools];
})(),
```

## Files to Modify

1. **`hooks/use-tool-settings.ts`** — Reorganize categories, add `core` field, update `getActiveTools`
2. **`components/tool-settings.tsx`** — Show core badge, disable toggle for core categories
3. **`app/(chat)/api/chat/route.ts`** — Update `allTools` array (add new tools, remove webSearch)

## ToggleSwitch Enhancement

Add `disabled` prop to `ToggleSwitch`:

```tsx
function ToggleSwitch({
  checked,
  onToggle,
  disabled = false,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
      onClick={disabled ? undefined : onToggle}
      type="button"
      disabled={disabled}
    >
      <span
        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
```

## Verification
- Tool settings dialog shows 7 categories (Documents, Plans, Discovery, Agent Browser, Browserbase, Code Execution, Utility)
- No "Web Search" category visible
- Documents, Plans, Discovery categories show "Core" badge and are always enabled
- Agent Browser, Browserbase, Code Execution, Utility can be toggled
- Toggling off a non-core category removes those tools from `selectedTools` sent to API
- Core tools are always sent regardless of toggle state
- `next build` passes
