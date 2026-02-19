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
 * Build a condensed checkpoint context when messages exceed token threshold.
 * Preserves the original user request and recent messages for continuity.
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

  // Keep last 8 messages for recent context
  const recentMessages = messages.slice(-8);

  const checkpointMessage = {
    role: "user" as const,
    content: `[CONTEXT CHECKPOINT - Your conversation history was trimmed to stay within context limits]

ORIGINAL REQUEST:
${originalText}

INSTRUCTIONS:
1. Use readPlan to check the current plan state
2. Use listDocuments to see what documents have been created
3. Continue executing the plan from where you left off
4. Always update the plan after completing each step

Recent context follows below.`,
  };

  return [checkpointMessage, ...recentMessages];
}
