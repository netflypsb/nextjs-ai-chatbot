# Phase 5B — Skills Architecture + readSkill / searchSkills Tools

## Objective
Implement a progressive-disclosure skills system adapted for Solaris Web (no filesystem, Vercel serverless). Skills are static markdown content files in the repo, with metadata registry and on-demand loading via tools.

## Architecture

### Skill Storage: Static files in repo
```
lib/ai/skills/
├── index.ts              # Skill registry (metadata + file loading)
├── agent-browser.md      # Agent-browser tool expertise
├── browserbase.md        # Browserbase tool expertise
├── online-research.md    # Online research best practices
├── web-tools.md          # Web tool usage patterns
└── presentation.md       # Presentation creation expertise
```

### Skill Registry (`lib/ai/skills/index.ts`)

```ts
export type SkillMetadata = {
  id: string;           // e.g. "agent-browser"
  name: string;         // e.g. "Agent Browser Specialist"
  description: string;  // Brief description for system prompt (~50-100 tokens)
  triggers: string[];   // Keywords that suggest this skill is relevant
};

// Metadata for all skills (loaded into system prompt)
export const SKILL_REGISTRY: SkillMetadata[] = [
  {
    id: "agent-browser",
    name: "Agent Browser Specialist",
    description: "Expert guidance on using agent-browser tools (navigate, interact, extract, close). Covers the ref/snapshot system, page interaction patterns, and debugging strategies.",
    triggers: ["browse", "navigate", "click", "web page", "scrape", "agent-browser"],
  },
  {
    id: "browserbase",
    name: "Browserbase Specialist",
    description: "Expert guidance on using browseWeb tool powered by Browserbase. Covers session management, content extraction, and when to use Browserbase vs agent-browser.",
    triggers: ["browserbase", "browseWeb", "extract content", "read page"],
  },
  {
    id: "online-research",
    name: "Online Research Specialist",
    description: "Best practices for conducting effective online research. Covers search strategies, query refinement, source evaluation, iterative research patterns, and synthesizing findings.",
    triggers: ["research", "search", "find information", "look up", "investigate"],
  },
  {
    id: "web-tools",
    name: "Web Tools Specialist",
    description: "Guide for selecting and using the right web tool for each task. Covers when to use agent-browser vs browseWeb, tool selection decision tree, and common web automation patterns.",
    triggers: ["web tool", "which tool", "browser tool", "automation"],
  },
  {
    id: "presentation",
    name: "Presentation Design Specialist",
    description: "Expert at creating beautiful, interactive slide presentations. Covers theme selection, visual hierarchy, content structure, markdown formatting for slides, and download optimization.",
    triggers: ["presentation", "slides", "slide deck", "powerpoint", "pptx"],
  },
];

// Load full skill content by ID
export async function getSkillContent(skillId: string): Promise<string | null> {
  // Use dynamic import of raw markdown files or fs.readFileSync
  // Since this runs server-side in Next.js API routes, we can use fs
  try {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "lib", "ai", "skills", `${skillId}.md`);
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

// Search skills by query (simple keyword matching)
export function searchSkills(query: string): SkillMetadata[] {
  const q = query.toLowerCase();
  return SKILL_REGISTRY.filter(
    (skill) =>
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.triggers.some((t) => q.includes(t) || t.includes(q))
  );
}

// Generate metadata block for system prompt
export function getSkillMetadataPrompt(): string {
  return SKILL_REGISTRY.map(
    (s) => `- **${s.name}** (id: \`${s.id}\`): ${s.description}`
  ).join("\n");
}
```

### New Tool: `readSkill` (`lib/ai/tools/read-skill.ts`)

```ts
import { tool } from "ai";
import { z } from "zod";
import { getSkillContent, SKILL_REGISTRY } from "@/lib/ai/skills";

export const readSkill = tool({
  description:
    "Load a skill to gain expert knowledge for a specific domain. Skills provide detailed instructions, best practices, and patterns. Use this BEFORE attempting tasks that match a skill's domain. Available skills are listed in your system prompt.",
  inputSchema: z.object({
    skillId: z
      .string()
      .describe(
        "The skill ID to load (e.g. 'agent-browser', 'online-research', 'presentation')"
      ),
  }),
  execute: async ({ skillId }) => {
    const skill = SKILL_REGISTRY.find((s) => s.id === skillId);
    if (!skill) {
      return {
        error: `Skill '${skillId}' not found. Available: ${SKILL_REGISTRY.map((s) => s.id).join(", ")}`,
      };
    }
    const content = await getSkillContent(skillId);
    if (!content) {
      return { error: `Failed to load skill content for '${skillId}'` };
    }
    return {
      skillId,
      name: skill.name,
      content,
    };
  },
});
```

### New Tool: `searchSkills` (`lib/ai/tools/search-skills.ts`)

```ts
import { tool } from "ai";
import { z } from "zod";
import { searchSkills as search, SKILL_REGISTRY } from "@/lib/ai/skills";

export const searchSkills = tool({
  description:
    "Search for relevant skills by keyword or topic. Returns matching skill metadata. Use this when you're unsure which skill to load for a task.",
  inputSchema: z.object({
    query: z.string().describe("Search query (e.g. 'browser automation', 'research', 'slides')"),
  }),
  execute: async ({ query }) => {
    const results = search(query);
    if (results.length === 0) {
      return {
        query,
        results: [],
        allSkills: SKILL_REGISTRY.map((s) => ({ id: s.id, name: s.name })),
        message: "No matching skills found. Here are all available skills.",
      };
    }
    return {
      query,
      results: results.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
      })),
    };
  },
});
```

## Files to Create
1. `lib/ai/skills/index.ts` — Skill registry
2. `lib/ai/tools/read-skill.ts` — readSkill tool
3. `lib/ai/tools/search-skills.ts` — searchSkills tool
4. Skill content files (created in Phase 5C):
   - `lib/ai/skills/agent-browser.md`
   - `lib/ai/skills/browserbase.md`
   - `lib/ai/skills/online-research.md`
   - `lib/ai/skills/web-tools.md`
   - `lib/ai/skills/presentation.md`

## Files to Modify

### 1. `app/(chat)/api/chat/route.ts`
- Import readSkill and searchSkills tools
- Add to `tools` object: `readSkill, searchSkills,`
- Add to `experimental_activeTools` array: `"readSkill", "searchSkills",`

### 2. `lib/types.ts`
- Add type imports for new tools
- Add to `ChatTools` type

### 3. `hooks/use-tool-settings.ts`
- Add new "Skills" category:
  ```ts
  {
    id: "skills",
    name: "Skills",
    description: "Search and load agent skills for specialized expertise",
    tools: ["readSkill", "searchSkills"],
  },
  ```

## Design Notes

### Why static files instead of database?
- Skills are system-level content, not user data
- Version controlled with the codebase
- No migration needed
- Instant reads (filesystem on server, or bundled)
- Can be updated with code deployments

### Why `process.cwd()` + `fs.readFileSync`?
- Next.js API routes run on Node.js server (not edge)
- `process.cwd()` resolves to project root on Vercel
- Static files in the repo are available at deploy time
- Alternative: use `import()` with raw loader, but fs is simpler

### Progressive disclosure token savings
- **Without skills**: All expert instructions in system prompt = ~5,000+ tokens
- **With skills**: Only metadata in prompt (~500 tokens) + content loaded on-demand (~2-4k tokens per skill, only when needed)
- **Net savings**: ~4,500+ tokens per request that doesn't need all skills

## Verification
- `next build` passes
- `readSkill({ skillId: "agent-browser" })` returns skill content
- `searchSkills({ query: "browser" })` returns matching skills
- Skills metadata appears in system prompt
