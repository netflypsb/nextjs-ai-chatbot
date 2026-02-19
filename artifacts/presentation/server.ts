import { smoothStream, streamText } from "ai";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { getArtifactModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const presentationDocumentHandler =
  createDocumentHandler<"presentation">({
    kind: "presentation",
    onCreateDocument: async ({ title, dataStream }) => {
      let draftContent = "";

      const { fullStream } = streamText({
        model: getArtifactModel(),
        system: `You are a presentation creator. Generate a slide presentation using Markdown.

Rules:
- Use "---" (three dashes on its own line) to separate slides
- The first slide should be a title slide with # heading
- Use ## for slide titles
- Use bullet points, numbered lists, bold, italic for content
- Use > for speaker notes (optional)
- Keep each slide focused and concise (3-6 bullet points max)
- Include a mix of content types: text, lists, quotes
- End with a summary or closing slide

Example format:
# Presentation Title
## Subtitle

---

## Slide 2 Title
- Point 1
- Point 2
- Point 3

---

## Slide 3 Title
1. First item
2. Second item

> Speaker note: mention the key takeaway

---

## Thank You
Questions?`,
        experimental_transform: smoothStream({ chunking: "word" }),
        prompt: title,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === "text-delta") {
          const { text } = delta;
          draftContent += text;

          dataStream.write({
            type: "data-presentationDelta",
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
        system: updateDocumentPrompt(document.content, "presentation"),
        experimental_transform: smoothStream({ chunking: "word" }),
        prompt: description,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === "text-delta") {
          const { text } = delta;
          draftContent += text;

          dataStream.write({
            type: "data-presentationDelta",
            data: text,
            transient: true,
          });
        }
      }

      return draftContent;
    },
  });
