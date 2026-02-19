# Phase 1D: Plan Management Tools

## Overview
Wrapper tools around the document system specifically for managing "plan" type documents. These provide a semantic interface for the agent to create, update, and read plans without needing to specify `kind: "plan"` each time.

## Why Separate Plan Tools?
From LangChain's Deep Agent research:
> "Planning (even if done via a no-op tool call) is a big component of [deep agent execution]."

Dedicated plan tools:
1. Make the agent's planning behavior explicit and predictable
2. Enforce plan document structure
3. Allow the system prompt to reference specific tool names for planning behavior
4. Enable `prepareStep` to detect when the agent has/hasn't created a plan

## Tools

### 1. `createPlan` (`lib/ai/tools/create-plan.ts`)
Creates a new plan document. This is a wrapper around `createDocument` that forces `kind: "plan"`.

**Input Schema:**
```typescript
z.object({
  title: z.string().describe("Title of the plan"),
  steps: z.array(z.string()).describe("List of planned steps to accomplish the goal"),
  objective: z.string().describe("The objective/goal this plan is for"),
})
```

**Implementation:**
- Generate UUID for document ID
- Stream plan metadata (id, title, kind) to frontend via dataStream
- Construct structured Markdown plan from the steps array
- Save as a "plan" kind document
- Return plan ID for future reference

### 2. `updatePlan` (`lib/ai/tools/update-plan.ts`)
Updates an existing plan document. Used to mark steps complete, add notes, change status.

**Input Schema:**
```typescript
z.object({
  id: z.string().describe("The plan document ID to update"),
  description: z.string().describe("Description of changes to make to the plan (e.g., 'Mark step 3 as complete', 'Add new step: Deploy to production', 'Update status to completed')"),
})
```

**Implementation:**
- Fetch existing plan document by ID
- Delegate to plan document handler's `onUpdateDocument`
- Stream updates to frontend
- Save updated version

### 3. `readPlan` (`lib/ai/tools/read-plan.ts`)
Reads the current state of a plan document.

**Input Schema:**
```typescript
z.object({
  id: z.string().describe("The plan document ID to read"),
})
```

**Implementation:**
- Fetch document by ID, verify kind is "plan"
- Return full content, title, creation date
- Used by the agent to check plan state before acting

## Registration
Register all three tools in:
1. `app/(chat)/api/chat/route.ts` tools object
2. `experimental_activeTools` array
3. `lib/types.ts` ChatTools type

## Key Design Decision
The `createPlan` tool constructs the plan Markdown directly from structured input (steps array) rather than using an LLM to generate it. This ensures:
- Consistent plan format every time
- No extra LLM call overhead
- Predictable structure that `prepareStep` can parse
