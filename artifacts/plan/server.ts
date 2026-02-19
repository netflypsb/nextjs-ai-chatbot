import { smoothStream, streamText } from "ai";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { getArtifactModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const planPrompt = `
You are a planning assistant. Create a structured plan document in Markdown format.

The plan MUST follow this exact structure:

# Plan: <title>

## Objective
<clear statement of what needs to be accomplished>

## Status: in_progress

## Steps
- [ ] Step 1: <description>
- [ ] Step 2: <description>
(number steps appropriately for the task complexity)

## Current Step: 1

## Notes
- Plan created

## Documents Created
(none yet)

Keep steps concrete and actionable. Each step should be achievable in a single agent action.
Do not add any preamble or explanation outside the plan structure.
`;

export const planDocumentHandler = createDocumentHandler<"plan">({
  kind: "plan",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: getArtifactModel(),
      system: planPrompt,
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: "data-planDelta",
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: getArtifactModel(),
      system: updateDocumentPrompt(document.content, "plan"),
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: description,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: "data-planDelta",
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});
