/**
 * Context management utilities for long-running agent tasks.
 * Implements token-aware windowing to prevent exceeding model context limits.
 */

/**
 * Estimate token count from a messages array.
 * Uses ~4 characters per token heuristic.
 */
export function estimateTokenCount(messages: any[]): number {
  let totalChars = 0;

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      totalChars += msg.content.length;
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (typeof part === "string") {
          totalChars += part.length;
        } else if (part.text) {
          totalChars += part.text.length;
        } else if (part.result) {
          totalChars += JSON.stringify(part.result).length;
        } else if (part.toolName) {
          totalChars += JSON.stringify(part).length;
        }
      }
    }

    // Count role string
    if (msg.role) {
      totalChars += msg.role.length;
    }
  }

  return Math.ceil(totalChars / 4);
}

/**
 * Extract text content from a message object.
 */
export function extractTextFromMessage(message: any): string {
  if (!message) {
    return "";
  }

  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part: any) => {
        if (typeof part === "string") {
          return part;
        }
        if (part.text) {
          return part.text;
        }
        return "";
      })
      .join(" ");
  }

  return "";
}

/**
 * Extract a summary of tool calls from messages that will be trimmed.
 * This helps the agent understand what was already accomplished.
 */
function summarizeToolCalls(messages: any[]): string {
  const toolSummaries: string[] = [];

  for (const msg of messages) {
    if (!Array.isArray(msg.content)) {
      continue;
    }

    for (const part of msg.content) {
      if (part.type === "tool-call" && part.toolName) {
        const args = part.args ? JSON.stringify(part.args).slice(0, 100) : "";
        toolSummaries.push(`- ${part.toolName}(${args})`);
      }
      if (part.type === "tool-result" && part.toolName) {
        const resultPreview = part.result
          ? JSON.stringify(part.result).slice(0, 80)
          : "completed";
        toolSummaries.push(`  → ${part.toolName} result: ${resultPreview}`);
      }
    }
  }

  if (toolSummaries.length === 0) {
    return "";
  }

  return `\nTOOL CALLS COMPLETED (trimmed messages):\n${toolSummaries.slice(0, 20).join("\n")}`;
}

/**
 * Build a condensed checkpoint context when messages exceed token threshold.
 * Preserves the original user request, tool call summary, and recent messages.
 */
export function buildCheckpointMessages(messages: any[]): any[] | null {
  const estimated = estimateTokenCount(messages);

  // Only checkpoint if we exceed 50k tokens
  if (estimated <= 50_000) {
    return null;
  }

  // Find the first user message (original request)
  const originalRequest = messages.find((m: any) => m.role === "user");
  const originalText = extractTextFromMessage(originalRequest);

  // Keep last 10 messages for recent context (increased from 8)
  const recentMessages = messages.slice(-10);

  // Summarize tool calls from trimmed messages
  const trimmedMessages = messages.slice(0, -10);
  const toolSummary = summarizeToolCalls(trimmedMessages);

  const checkpointMessage = {
    role: "user" as const,
    content: `[CONTEXT CHECKPOINT - Your conversation history was trimmed to stay within context limits]

ORIGINAL REQUEST:
${originalText}
${toolSummary}

INSTRUCTIONS:
1. Use readPlan to check the current plan state and see which steps are done
2. Use listDocuments to see what documents/artifacts have been created
3. Use readDocument to inspect any artifact content if needed for context
4. Continue executing the plan from where you left off
5. Always update the plan after completing each step
6. Before marking the task complete, perform a QUALITY CHECK on final deliverables

IMPORTANT: Do NOT restart completed steps. Resume from where you left off.

Recent context follows below.`,
  };

  return [checkpointMessage, ...recentMessages];
}
