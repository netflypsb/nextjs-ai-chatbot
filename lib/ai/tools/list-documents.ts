import { tool } from "ai";
import { z } from "zod";
import type { Session } from "@/lib/auth";
import { artifactKinds } from "@/lib/artifacts/server";
import { getDocumentsByUserId } from "@/lib/db/queries";

type ListDocumentsProps = {
  session: Session;
};

export const listDocuments = ({ session }: ListDocumentsProps) =>
  tool({
    description:
      "List user's documents with optional filtering by kind. Returns document IDs, titles, kinds, and creation dates.",
    inputSchema: z.object({
      kind: z
        .enum(artifactKinds)
        .optional()
        .describe("Filter by document kind"),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe("Max results to return"),
    }),
    execute: async ({ kind, limit }) => {
      if (!session.user?.id) {
        return { error: "Unauthorized" };
      }

      const results = await getDocumentsByUserId({
        userId: session.user.id,
        kind,
        limit,
      });

      return {
        documents: results,
        count: results.length,
      };
    },
  });
