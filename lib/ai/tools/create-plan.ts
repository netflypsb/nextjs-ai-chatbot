import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "@/lib/auth";
import { saveDocument } from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

type CreatePlanProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const createPlan = ({ session, dataStream }: CreatePlanProps) =>
  tool({
    description:
      "Create a new plan document for tracking a multi-step task. Use this FIRST when tackling any complex task. The plan will be displayed as an artifact.",
    inputSchema: z.object({
      title: z.string().describe("Title of the plan"),
      objective: z
        .string()
        .describe("The objective/goal this plan is for"),
      steps: z
        .array(z.string())
        .describe("List of planned steps to accomplish the goal"),
    }),
    execute: async ({ title, objective, steps }) => {
      const id = generateUUID();

      // Build structured Markdown plan
      const stepsList = steps
        .map((step, i) => `- [ ] Step ${i + 1}: ${step}`)
        .join("\n");

      const content = `# Plan: ${title}

## Objective
${objective}

## Status: in_progress

## Steps
${stepsList}

## Current Step: 1

## Notes
- Plan created

## Documents Created
(none yet)
`;

      // Stream artifact metadata to frontend
      dataStream.write({ type: "data-id", data: id });
      dataStream.write({ type: "data-title", data: title });
      dataStream.write({ type: "data-kind", data: "plan" });
      dataStream.write({ type: "data-clear", data: null });

      // Stream the content character by character for visual effect
      const words = content.split(" ");
      for (const word of words) {
        dataStream.write({
          type: "data-planDelta",
          data: `${word} `,
          transient: true,
        });
      }

      dataStream.write({ type: "data-finish", data: null });

      // Save to database
      if (session.user?.id) {
        await saveDocument({
          id,
          title,
          content,
          kind: "plan",
          userId: session.user.id,
        });
      }

      return {
        id,
        title,
        kind: "plan",
        message: `Plan "${title}" created with ${steps.length} steps`,
      };
    },
  });
