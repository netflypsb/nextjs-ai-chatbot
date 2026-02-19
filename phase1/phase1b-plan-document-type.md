# Phase 1B: Plan Document Type

## Overview
Add a new "plan" artifact kind to the document system. This is a structured planning document that enables the agent to operate as a "deep agent" capable of complex, long-horizon tasks.

## Deep Agent Planning Concept (from research)

### LangChain Deep Agents (https://blog.langchain.com/deep-agents/)
> "Claude Code uses a Todo list tool. Funnily enough - this doesn't do anything! It's basically a no-op. It's just a context engineering strategy to keep the agent on track."

Key insight: The plan document serves as a **context engineering tool**. Even if the plan itself is simple, having the agent write and update it keeps it focused on long-horizon tasks.

### Four characteristics of deep agents:
1. **Detailed system prompt** - covered in Phase 1E
2. **Planning tool** - THIS PHASE
3. **Sub agents** - future phase
4. **File system** - we use the document/artifact system as a virtual filesystem

## Architecture

### How existing document types work:
1. **DB Schema** (`lib/db/schema.ts`): `document` table with `kind` enum
2. **Server handler** (`artifacts/<kind>/server.ts`): `createDocumentHandler()` with `onCreateDocument` and `onUpdateDocument`
3. **Client artifact** (`artifacts/<kind>/client.tsx`): `new Artifact()` with `kind`, `description`, `onStreamPart`, `content` component, `actions`, `toolbar`
4. **Registration**: Server handler added to `documentHandlersByArtifactKind` array in `lib/artifacts/server.ts`, client artifact added to `artifactDefinitions` in `components/artifact.tsx`
5. **Streaming**: Each type writes `data-<kind>Delta` events to the data stream
6. **Type system**: `CustomUIDataTypes` in `lib/types.ts` maps delta type names

### Plan document structure (Markdown with structured sections):
```markdown
# Plan: <title>

## Objective
<original user request>

## Status: in_progress | completed | blocked

## Steps
- [ ] Step 1: Description
- [ ] Step 2: Description
- [x] Step 3: Description (completed)

## Current Step: <number>

## Notes
- <observations, context, decisions>

## Documents Created
- <id>: <title> (<kind>)
```

## Implementation Steps

### 1. Update DB schema
In `lib/db/schema.ts`, add "plan" to the document kind enum:
```typescript
kind: varchar("text", { enum: ["text", "code", "image", "sheet", "plan"] })
```

### 2. Update `artifactKinds` in `lib/artifacts/server.ts`
```typescript
export const artifactKinds = ["text", "code", "sheet", "plan"] as const;
```

### 3. Create `artifacts/plan/server.ts`
- Use `createDocumentHandler<"plan">()` pattern
- `onCreateDocument`: Use `streamText` (like text handler) with a plan-specific system prompt
- `onUpdateDocument`: Use `streamText` with update prompt that preserves plan structure
- Stream `data-planDelta` events

### 4. Create `artifacts/plan/client.tsx`
- `new Artifact<"plan">()` with:
  - `kind: "plan"`
  - `description`: "Structured planning document for tracking multi-step tasks"
  - `onStreamPart`: Handle `data-planDelta` events (append mode like text)
  - `content`: Render plan as markdown with checkboxes
  - `actions`: Copy, undo/redo version navigation
  - `toolbar`: Minimal (plans are agent-managed)

### 5. Register server handler
Add `planDocumentHandler` to `documentHandlersByArtifactKind` in `lib/artifacts/server.ts`

### 6. Register client artifact
Add `planArtifact` to `artifactDefinitions` in `components/artifact.tsx`

### 7. Add streaming type
Add `planDelta: string` to `CustomUIDataTypes` in `lib/types.ts`

### 8. Add plan prompt
Add `planPrompt` and plan-specific update prompt to `lib/ai/prompts.ts`

### 9. Run DB migration
```bash
pnpm db:generate
pnpm db:migrate
```

## Plan System Prompt (for server handler)
```
You are a planning assistant. Create a structured plan document in Markdown format.

The plan MUST follow this exact structure:
# Plan: <title>

## Objective
<clear statement of what needs to be accomplished>

## Status: in_progress

## Steps
- [ ] Step 1: <description>
- [ ] Step 2: <description>
(number steps appropriately for the task)

## Current Step: 1

## Notes
- Plan created at <timestamp>

## Documents Created
(none yet)

Keep steps concrete and actionable. Each step should be achievable in a single agent action.
```
