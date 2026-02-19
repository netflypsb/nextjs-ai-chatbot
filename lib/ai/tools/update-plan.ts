import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "@/lib/auth";
import { documentHandlersByArtifactKind } from "@/lib/artifacts/server";
import { getDocumentById } from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type UpdatePlanProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const updatePlan = ({ session, dataStream }: UpdatePlanProps) =>
  tool({
    description:
      "Update an existing plan document. Use this after completing each step to mark progress, add notes, or adjust the plan.",
    inputSchema: z.object({
      id: z.string().describe("The plan document ID to update"),
      description: z
        .string()
        .describe(
          "Description of changes to make (e.g., 'Mark step 3 as complete', 'Add new step: Deploy', 'Update status to completed')"
        ),
    }),
    execute: async ({ id, description }) => {
      if (!session.user?.id) {
        return { error: "Unauthorized" };
      }

      const doc = await getDocumentById({ id });

      if (!doc) {
        return { error: "Plan document not found" };
      }

      if (doc.kind !== "plan") {
        return { error: "Document is not a plan" };
      }

      if (doc.userId !== session.user.id) {
        return { error: "Forbidden" };
      }

      // Stream artifact metadata
      dataStream.write({ type: "data-id", data: id });
      dataStream.write({ type: "data-title", data: doc.title });
      dataStream.write({ type: "data-kind", data: "plan" });
      dataStream.write({ type: "data-clear", data: null });

      // Delegate to plan document handler for AI-powered update
      const planHandler = documentHandlersByArtifactKind.find(
        (h) => h.kind === "plan"
      );

      if (planHandler) {
        await planHandler.onUpdateDocument({
          document: doc,
          description,
          dataStream,
          session,
        });
      }

      dataStream.write({ type: "data-finish", data: null });

      return {
        id,
        title: doc.title,
        kind: "plan",
        message: `Plan "${doc.title}" updated: ${description}`,
      };
    },
  });
