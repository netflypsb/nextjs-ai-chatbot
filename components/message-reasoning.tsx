"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "./ai-elements/chain-of-thought";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "./elements/reasoning";

type MessageReasoningProps = {
  isLoading: boolean;
  reasoning: string;
};

function parseReasoningSteps(
  text: string
): { label: string; detail?: string }[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const steps: { label: string; detail?: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match numbered steps like "1. Step text" or "Step 1: text"
    const numberedMatch = trimmed.match(
      /^(?:\d+[.)]\s*|Step\s+\d+[:.]\s*)(.*)/i
    );
    // Match bullet points
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);

    if (numberedMatch) {
      steps.push({ label: numberedMatch[1] });
    } else if (bulletMatch) {
      steps.push({ label: bulletMatch[1] });
    } else if (trimmed.length > 10) {
      // Long lines that look like thinking paragraphs
      steps.push({
        label: trimmed.slice(0, 120) + (trimmed.length > 120 ? "..." : ""),
      });
    }
  }

  return steps;
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [hasBeenStreaming, setHasBeenStreaming] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setHasBeenStreaming(true);
    }
  }, [isLoading]);

  const steps = useMemo(() => parseReasoningSteps(reasoning), [reasoning]);

  // Use ChainOfThought UI when there are identifiable steps
  if (steps.length >= 2) {
    return (
      <ChainOfThought
        data-testid="message-reasoning"
        defaultOpen={hasBeenStreaming}
      >
        <ChainOfThoughtHeader>
          {isLoading ? "Thinking..." : "Chain of Thought"}
        </ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {steps.map((step) => (
            <ChainOfThoughtStep
              key={`step-${step.label.slice(0, 40)}`}
              label={step.label}
              status={
                isLoading && step === steps.at(-1) ? "active" : "complete"
              }
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
    );
  }

  // Fallback to standard reasoning UI for unstructured text
  return (
    <Reasoning
      data-testid="message-reasoning"
      defaultOpen={hasBeenStreaming}
      isStreaming={isLoading}
    >
      <ReasoningTrigger />
      <ReasoningContent>{reasoning}</ReasoningContent>
    </Reasoning>
  );
}
