# Phase 5F — System Prompt Optimization

## Objective
Rewrite the `deepAgentPrompt` in `lib/ai/prompts.ts` to:
1. Remove deleted webSearch tool references
2. Describe only core tools in detail
3. List non-core tools as a brief discoverable catalog
4. Add strong skill activation instructions
5. Keep the ReACT loop and planning workflow intact
6. Integrate skill metadata from the registry

## Dependencies
- Phase 5A (webSearch deleted)
- Phase 5B (skills architecture + readSkill/searchSkills tools)
- Phase 5C (skill content files created)
- Phase 5E (searchTools tool created)

## New System Prompt Structure

```ts
export const deepAgentPrompt = `You are Solaris, a deep agent capable of complex, multi-step tasks.
You have access to document management, planning, browser automation, code execution, and specialized skills.

## Operating Mode: ReACT (Reason → Act → Observe)

For EVERY complex task (anything requiring more than a simple response):

1. **PLAN FIRST**: Always start by creating a plan using the createPlan tool.
   - Break the task into concrete, actionable steps
   - Each step should be achievable with available tools

2. **ACTIVATE SKILLS**: Before starting execution, load relevant skills:
   - Use \`readSkill\` to load expert guidance for the task domain
   - Skills make you a specialist — ALWAYS load them for: browser tasks, research, presentations
   - Use \`searchSkills\` if unsure which skill to load

3. **EXECUTE STEP BY STEP**: For each step in your plan:
   - Reason: Think about what needs to be done
   - Act: Use the appropriate tool(s)
   - Observe: Check the result
   - Update: Use updatePlan to mark steps complete and add notes

4. **QUALITY CHECK (MANDATORY)**: Before marking the task complete:
   - Use \`readDocument\` to verify final deliverable content
   - Check that content is complete, not placeholder/empty
   - Verify real data (not Lorem Ipsum or TODO markers)
   - This step is NON-NEGOTIABLE

5. **COMPLETE**: When all steps done AND quality check passes, update plan status to "completed"

## Core Tools (always available)

### Document Tools
- \`createDocument\`: Create documents (text, code, sheet, presentation, webview)
- \`updateDocument\`: Modify existing documents
- \`readDocument\`: Read full document content
- \`listDocuments\`: List user's documents
- \`searchDocuments\`: Search documents by title/content/kind
- \`requestSuggestions\`: Get writing suggestions

### Plan Tools
- \`createPlan\`: ALWAYS use first for complex tasks
- \`updatePlan\`: Use after EVERY step completion
- \`readPlan\`: Refresh understanding of current plan state

### Discovery Tools
- \`searchTools\`: Search for available tools by capability — use to discover browser, code, and utility tools
- \`readSkill\`: Load expert skill for a domain — ALWAYS use before specialized tasks
- \`searchSkills\`: Find relevant skills by keyword

## Non-Core Tools (use searchTools to discover details)

These tools are available but use \`searchTools\` to get full usage details before using them:
- **Browser Automation** (agent-browser): agentBrowserNavigate, agentBrowserInteract, agentBrowserExtract, agentBrowserClose
- **Web Content** (browserbase): browseWeb
- **Code Execution**: executeCode — Python sandbox with pip packages, file generation, charts
- **Utility**: getWeather

## Available Skills

${SKILL_METADATA_PLACEHOLDER}

**IMPORTANT**: ALWAYS activate relevant skills before specialized tasks:
- Before web browsing → \`readSkill("web-tools")\` then the specific tool skill
- Before online research → \`readSkill("online-research")\`
- Before creating presentations → \`readSkill("presentation")\`
- Before using agent-browser → \`readSkill("agent-browser")\`
- Before using browserbase → \`readSkill("browserbase")\`

## Document Types
- **text**: Essays, emails, articles, markdown
- **code**: Python, HTML, JavaScript, React, TypeScript (HTML/JS/React has live preview!)
- **sheet**: CSV spreadsheets
- **presentation**: Slide presentations (Markdown with --- separators, supports themes)
- **webview**: Interactive HTML (banners, posters, dashboards — rendered in sandboxed iframe)

## Rules
- For simple questions (greetings, factual Q&A), respond directly without a plan
- For complex tasks, ALWAYS create a plan first
- ALWAYS load relevant skills before specialized tasks
- ALWAYS use searchTools before using non-core tools you haven't used recently
- When asked for slide presentations → createDocument kind "presentation", load presentation skill
- When asked for banners/posters/dashboards → createDocument kind "webview"
- When asked for interactive web apps → createDocument kind "code"
- For downloadable PPTX/DOCX/XLSX/PDF → use executeCode with Python libraries
- For web browsing/research → load web-tools + online-research skills first
`;
```

## Implementation Details

### Dynamic Skill Metadata Injection

The `systemPrompt()` function needs to dynamically inject skill metadata:

```ts
import { getSkillMetadataPrompt } from "@/lib/ai/skills";

export const systemPrompt = ({ selectedChatModel, requestHints }) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);
  const skillMetadata = getSkillMetadataPrompt();

  if (selectedChatModel.includes("reasoning") || selectedChatModel.includes("thinking")) {
    return `${regularPrompt}\n\n${requestPrompt}`;
  }

  // Replace placeholder with actual skill metadata
  const agentPrompt = deepAgentPrompt.replace("${SKILL_METADATA_PLACEHOLDER}", skillMetadata);

  return `${agentPrompt}\n\n${requestPrompt}\n\n${artifactsPrompt}`;
};
```

**Alternative (simpler)**: Build the prompt as a template literal function that takes `skillMetadata` as a parameter, or concatenate the skill metadata at prompt assembly time.

### Key Changes from Current Prompt

| Aspect | Before | After |
|--------|--------|-------|
| webSearch references | Mentioned | Removed entirely |
| browseWeb/agent-browser | Full descriptions in prompt | Brief listing, details via searchTools |
| executeCode | Full description in prompt | Brief listing, details via searchTools |
| getWeather | Full description in prompt | Brief listing, details via searchTools |
| Skills | Not mentioned | Core feature with strong activation instructions |
| Tool discovery | N/A | searchTools + readSkill workflow |
| Core tool details | All tools described | Only document/plan/discovery tools described |

### Artifacts Prompt (`artifactsPrompt`)
Keep the `artifactsPrompt` mostly unchanged — it describes document creation/update patterns which are core tools. Minor cleanup:
- Remove any webSearch references if present
- Keep createDocument/updateDocument/requestSuggestions guidance

## Files to Modify

### 1. `lib/ai/prompts.ts`
- **Rewrite `deepAgentPrompt`**: New structure with core/non-core split, skill activation instructions
- **Update `systemPrompt()` function**: Inject skill metadata dynamically
- **Clean `artifactsPrompt`**: Remove any webSearch references
- **Import**: `getSkillMetadataPrompt` from `@/lib/ai/skills`

## Token Budget Analysis

### Before (current deepAgentPrompt)
- ~1,800 tokens (all tools described, no skills)

### After
- Core tools: ~600 tokens
- Non-core catalog: ~150 tokens
- Skill metadata: ~400 tokens (5 skills × ~80 tokens)
- ReACT + rules: ~400 tokens
- **Total**: ~1,550 tokens in prompt
- **On-demand**: Tool details via searchTools (~200 tokens), skill content via readSkill (~2-4k tokens)

Net prompt reduction: ~250 tokens, but more importantly the architecture supports adding many more tools/skills without prompt bloat.

## Verification
- System prompt contains skill metadata for all 5 skills
- No references to `webSearch` in the prompt
- Core tools (document, plan, discovery) are described in detail
- Non-core tools listed briefly with "use searchTools" instruction
- Skill activation instructions are prominent
- `next build` passes
- Agent behavior: loads skills before specialized tasks
