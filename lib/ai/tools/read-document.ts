import { tool } from "ai";
import { z } from "zod";
import type { Session } from "@/lib/auth";
import { getDocumentById } from "@/lib/db/queries";

type ReadDocumentProps = {
  session: Session;
};

export const readDocument = ({ session }: ReadDocumentProps) =>
  tool({
    description:
      "Read the full content of a document by its ID. Returns the latest version of the document.",
    inputSchema: z.object({
      id: z.string().describe("The document ID to read"),
    }),
    execute: async ({ id }) => {
      if (!session.user?.id) {
        return { error: "Unauthorized" };
      }

      const doc = await getDocumentById({ id });

      if (!doc) {
        return { error: "Document not found" };
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
