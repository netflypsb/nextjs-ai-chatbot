# Phase 1E: ReACT Loop & Agent Behavior

## Overview
Transform the chatbot into a ReACT (Reason-Act-Observe) deep agent by modifying the system prompt, increasing step limits, and implementing structured agent behavior using Vercel AI SDK's loop control.

## ReACT Pattern (from research)

### What is ReACT?
ReACT (Reason + Act) is an agent pattern where the model:
1. **Reason**: Think about what to do next given the current state
2. **Act**: Execute a tool/action
3. **Observe**: Process the result
4. **Repeat** until task is complete

### LangChain ReACT Agent (https://github.com/langchain-ai/react-agent)
> "The ReAct agent: Takes a user query → Reasons about the query and decides on an action → Executes the chosen action using available tools → Observes the result → Repeats until it can provide a final answer"

### Vercel AI SDK Loop Control (https://ai-sdk.dev/docs/agents/loop-control)
- `stopWhen: stepCountIs(N)` - controls max steps
- `prepareStep` - runs before each step, can modify model, tools, messages
- Default stop: 20 steps via `stepCountIs(20)`
- Can combine multiple stop conditions

## Implementation Steps

### 1. Increase step count
In `app/(chat)/api/chat/route.ts`:
```typescript
// Change from:
stopWhen: stepCountIs(5),
// To:
stopWhen: stepCountIs(1000),
```

### 2. Update system prompt for ReACT behavior
Add a deep agent system prompt to `lib/ai/prompts.ts`:

```typescript
export const deepAgentPrompt = `
You are Solaris Web, a deep agent capable of complex, multi-step tasks.

## Operating Mode: ReACT (Reason → Act → Observe)

For EVERY complex task (anything requiring more than a simple response):

1. **PLAN FIRST**: Always start by creating a plan using the createPlan tool.
   - Break the task into concrete, actionable steps
   - Each step should be achievable with available tools

2. **EXECUTE STEP BY STEP**: For each step in your plan:
   - Reason: Think about what needs to be done for this step
   - Act: Use the appropriate tool(s)
   - Observe: Check the result
   - Update: Update the plan to mark the step complete and add notes

3. **ALWAYS UPDATE THE PLAN**: After completing each step, use updatePlan to:
   - Mark the completed step as done
   - Add any observations or notes
   - Adjust remaining steps if needed

4. **COMPLETE**: When all steps are done, update the plan status to "completed"

## Tool Usage Guidelines

### Planning Tools
- \`createPlan\`: ALWAYS use this first for complex tasks
- \`updatePlan\`: Use after EVERY step completion
- \`readPlan\`: Use to refresh your understanding of the current plan state

### Document Tools
- \`createDocument\`: Create text, code, sheet, or image documents
- \`updateDocument\`: Modify existing documents
- \`searchDocuments\`: Find documents by title/content/kind
- \`listDocuments\`: List user's documents
- \`readDocument\`: Read full document content

### Rules
- For simple questions (greetings, factual Q&A), respond directly without creating a plan
- For complex tasks (writing, coding, research, multi-step work), ALWAYS create a plan first
- Never skip the planning step for complex tasks
- Always update the plan after each step
- If a step fails, note the failure in the plan and adjust strategy
`;
```

### 3. Update the system prompt function
Modify `systemPrompt()` in `lib/ai/prompts.ts` to include the deep agent prompt:

```typescript
export const systemPrompt = ({ selectedChatModel, requestHints }) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);
  
  if (selectedChatModel.includes("reasoning") || selectedChatModel.includes("thinking")) {
    return `${regularPrompt}\n\n${requestPrompt}`;
  }

  return `${deepAgentPrompt}\n\n${requestPrompt}\n\n${artifactsPrompt}`;
};
```

### 4. Register all new tools in route.ts
Add all tools to the `tools` object and `experimental_activeTools`:

```typescript
tools: {
  getWeather,
  createDocument: createDocument({ session, dataStream }),
  updateDocument: updateDocument({ session, dataStream }),
  requestSuggestions: requestSuggestions({ session, dataStream }),
  // New document management tools
  searchDocuments: searchDocuments({ session }),
  listDocuments: listDocuments({ session }),
  readDocument: readDocument({ session }),
  // Plan management tools
  createPlan: createPlan({ session, dataStream }),
  updatePlan: updatePlan({ session, dataStream }),
  readPlan: readPlan({ session }),
},
experimental_activeTools: isReasoningModel ? [] : [
  "getWeather",
  "createDocument", "updateDocument", "requestSuggestions",
  "searchDocuments", "listDocuments", "readDocument",
  "createPlan", "updatePlan", "readPlan",
],
```

## Vercel AI SDK Reference
- `stepCountIs(n)`: Built-in stop condition
- `prepareStep`: Hook that runs before each step (used in Phase 1F for context management)
- `streamText`: The core function that powers the agent loop
- The agent loop continues until: no more tool calls, step limit reached, or custom stop condition met
