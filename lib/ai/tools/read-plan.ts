import { tool } from "ai";
import { z } from "zod";
import type { Session } from "@/lib/auth";
import { getDocumentById } from "@/lib/db/queries";

type ReadPlanProps = {
  session: Session;
};

export const readPlan = ({ session }: ReadPlanProps) =>
  tool({
    description:
      "Read the current state of a plan document. Use this to check plan progress before continuing work.",
    inputSchema: z.object({
      id: z.string().describe("The plan document ID to read"),
    }),
    execute: async ({ id }) => {
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

      return {
        id: doc.id,
        title: doc.title,
        kind: doc.kind,
        content: doc.content,
        createdAt: doc.createdAt,
      };
    },
  });
