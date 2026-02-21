# Phase 5 Implementation Plan — Overview

## Summary

Phase 5 transforms Solaris from a tool-heavy agent into a **skill-aware, context-efficient deep agent** with:
- On-demand skill loading (progressive disclosure)
- Dynamic tool discovery (tool-search pattern)
- Enhanced presentation capabilities
- Streamlined system prompt

## Architecture Decisions

### 1. Skills Architecture (Adapted for Web App)

**Problem**: Anthropic's agent-skills rely on filesystem access + bash. Solaris runs on Vercel (serverless, no persistent filesystem).

**Solution**: Static TypeScript skill files in the repo with a `readSkill` tool for on-demand loading.

```
lib/ai/skills/
├── index.ts              # Skill registry: metadata for all skills
├── agent-browser.md      # Full instructions for agent-browser usage
├── browserbase.md        # Full instructions for browserbase usage
├── online-research.md    # Online research best practices
├── web-tools.md          # Web tool usage best practices
└── presentation.md       # Presentation creation expertise
```

**Progressive Disclosure (3 levels)**:
- **Level 1 — Metadata** (~100 tokens/skill): Name + description loaded into system prompt at startup. Agent knows what skills exist.
- **Level 2 — Instructions** (1-5k tokens/skill): Full skill content loaded on-demand via `readSkill` tool. Only enters context when needed.
- No Level 3 (no bash/script execution in web app context).

### 2. Tool Search / Discovery (Custom Implementation)

**Problem**: Anthropic's `tool_search_tool` is a native API feature (requires direct Anthropic API). Solaris uses OpenRouter. Also, Vercel AI SDK's `streamText()` requires all tools registered upfront — can't truly defer tool registration.

**Solution**: Custom `searchTools` tool + prompt-level tool hiding.

- **All tools remain registered** with `streamText()` (SDK requirement)
- **System prompt only describes "core" tools** in detail
- **Non-core tools listed as brief catalog** (name + one-line description, ~200 tokens total)
- **`searchTools` tool** returns full descriptions/parameters of matching tools
- Agent discovers tool details via `searchTools`, then uses them (already registered)

**Core tools** (always described in prompt):
- Document management: createDocument, updateDocument, readDocument, listDocuments, searchDocuments, requestSuggestions
- Plan management: createPlan, updatePlan, readPlan
- Discovery: searchTools, readSkill

**Non-core tools** (discoverable via searchTools):
- Browser: agentBrowserNavigate, agentBrowserInteract, agentBrowserExtract, agentBrowserClose
- Browserbase: browseWeb
- Code execution: executeCode
- Utility: getWeather

### 3. Presentation Enhancement

**Current state**: Basic markdown→HTML with hardcoded inline styles. No themes, no images, no gradients.

**Enhancement approach**:
- Theme system with predefined themes (dark, light, corporate, creative, etc.)
- Image support via `![alt](url)` markdown syntax
- CSS gradient backgrounds per slide via frontmatter directives
- Better typography, spacing, and visual hierarchy
- Enhanced `renderMarkdownToHtml()` function
- Presentation skill teaches the agent how to create beautiful slides

### 4. Web Search Tool Removal

**Current state**: `webSearch` tool uses Brave Search API (no API key provided, doesn't work). DuckDuckGo fallback is unreliable.

**Action**: Delete the tool entirely. Agent uses `agentBrowserNavigate` (for search engines) and `browseWeb` (for URL content extraction) instead, guided by skills.

---

## Phase Execution Order

| Phase | Name | Dependencies | Estimated Complexity |
|-------|------|-------------|---------------------|
| **5A** | Delete webSearch tool | None | Low |
| **5B** | Skills architecture + readSkill tool | None | Medium |
| **5C** | Create 5 skills (content files) | 5B | Medium |
| **5D** | Presentation enhancement | None | Medium-High |
| **5E** | Tool search/discovery system | 5A | Medium |
| **5F** | System prompt optimization | 5A, 5B, 5C, 5E | Medium |
| **5G** | Tool settings UI update | 5A, 5E | Low |

**Recommended implementation order**: 5A → 5B → 5C → 5D → 5E → 5F → 5G

Each phase should pass `next build` before proceeding to the next.
