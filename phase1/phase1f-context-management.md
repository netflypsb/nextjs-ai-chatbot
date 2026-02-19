# Phase 1F: Context Management / Memory

## Overview
Implement token-aware context management using Vercel AI SDK's `prepareStep` to handle long-running agent tasks that may exceed the model's context window. This creates a checkpoint/continue system similar to LangGraph's state management but using the existing document system as persistence.

## Problem Statement
In the current implementation, all messages, tool calls, and tool results accumulate in the conversation history. For long-running tasks with many tool calls, this can exceed the model's context window (typically 128K-200K tokens). We need a mechanism to:
1. Detect when context is growing large
2. Create a checkpoint summarizing the current state
3. Continue execution with a condensed context

## Research References

### Vercel AI SDK - prepareStep Context Management
From https://ai-sdk.dev/docs/agents/loop-control:
```typescript
prepareStep: async ({ messages }) => {
  if (messages.length > 20) {
    return {
      messages: [
        messages[0], // Keep system instructions
        ...messages.slice(-10), // Keep last 10 messages
      ],
    };
  }
  return {};
},
```

### LangChain Deep Agents - File System as Memory
> "Deep agents run for long periods of time and accumulate a lot of context that they need to manage. Having a file system handy to store (and then later read from) is helpful for doing so."

### Vercel AI SDK - Custom Memory Tool
From https://ai-sdk.dev/docs/agents/memory:
- Core Memory: injected every turn (system prompt)
- Archival Memory: stored/retrieved on demand (our plan documents)
- Recall Memory: conversation history

## Architecture

### Token Estimation
Use a simple heuristic: ~4 characters per token. For a 50,000 token threshold:
- Estimate total context size from messages array
- When estimated tokens exceed threshold, trigger checkpoint

### Checkpoint State
When context grows large, create a summary state that includes:
1. **Original user request** (first user message)
2. **Current plan state** (read the active plan document)
3. **Documents created** (list of document IDs and titles)
4. **Last few messages** (recent context for continuity)
5. **Instruction to continue** using file access tools

### prepareStep Implementation
```typescript
prepareStep: async ({ stepNumber, steps, messages }) => {
  // Estimate token count from messages
  const estimatedTokens = estimateTokenCount(messages);
  
  if (estimatedTokens > 50000) {
    // Extract key context
    const originalRequest = messages.find(m => m.role === 'user');
    const recentMessages = messages.slice(-6); // Last 3 exchanges
    
    // Build condensed context message
    const checkpointMessage = {
      role: 'user' as const,
      content: `[CONTEXT CHECKPOINT]
You are continuing a long-running task. Here is your context:

ORIGINAL REQUEST:
${extractTextFromMessage(originalRequest)}

INSTRUCTIONS:
1. Use readPlan to check the current plan state
2. Use listDocuments to see what documents have been created
3. Continue executing the plan from where you left off
4. Always update the plan after completing each step

Recent context follows.`
    };
    
    return {
      messages: [
        checkpointMessage,
        ...recentMessages,
      ],
    };
  }
  
  return {};
},
```

## Implementation Steps

### 1. Create `lib/ai/context-manager.ts`
Utility functions for:
- `estimateTokenCount(messages)`: Estimate tokens from message array
- `extractTextFromMessage(message)`: Extract text content from a message
- `buildCheckpointContext(messages)`: Build the condensed checkpoint context

### 2. Add `prepareStep` to `streamText` in route.ts
Wire the context management into the agent loop.

### 3. Token estimation function
```typescript
export function estimateTokenCount(messages: any[]): number {
  let totalChars = 0;
  for (const msg of messages) {
    if (typeof msg.content === 'string') {
      totalChars += msg.content.length;
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (typeof part === 'string') totalChars += part.length;
        else if (part.text) totalChars += part.text.length;
        else if (part.result) totalChars += JSON.stringify(part.result).length;
      }
    }
  }
  return Math.ceil(totalChars / 4); // ~4 chars per token
}
```

## Key Design Decisions
1. **50,000 token threshold** - leaves headroom for model response within 128K context
2. **Plan document as persistent state** - the plan document IS the checkpoint; the agent reads it to know what to do next
3. **No external state store needed** - leverages existing document system
4. **Graceful degradation** - if estimation is off, the model still works (just with truncated old context)
5. **Recent messages preserved** - always keep last few messages for immediate continuity
