import { tool } from "ai";
import { z } from "zod";
import type { Session } from "@/lib/auth";
import { artifactKinds } from "@/lib/artifacts/server";
import { searchDocumentsByUser } from "@/lib/db/queries";

type SearchDocumentsProps = {
  session: Session;
};

export const searchDocuments = ({ session }: SearchDocumentsProps) =>
  tool({
    description:
      "Search existing documents by title, content, or kind. Returns matching documents with a content preview.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Search term to match against title or content"),
      kind: z
        .enum(artifactKinds)
        .optional()
        .describe("Filter by document kind"),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Max results to return"),
    }),
    execute: async ({ query, kind, limit }) => {
      if (!session.user?.id) {
        return { error: "Unauthorized" };
      }

      const results = await searchDocumentsByUser({
        userId: session.user.id,
        query,
        kind,
        limit,
      });

      return {
        documents: results,
        count: results.length,
      };
    },
  });
