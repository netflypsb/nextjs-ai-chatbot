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
- Use > for callout/highlight boxes
- Keep each slide focused and concise (3-6 bullet points max)
- Include a mix of content types: text, lists, quotes, tables
- Use images where relevant: ![description](https://url)
- End with a summary or closing slide

Theme directives (place at top of any slide as HTML comment):
- <!-- theme: dark --> for dark background
- <!-- theme: corporate --> for professional look
- <!-- theme: creative --> for gradient background
- <!-- theme: minimal --> for clean, simple look
- <!-- bg: linear-gradient(135deg, #color1, #color2) --> for custom gradient
- <!-- color: #ffffff --> for custom text color

Example format:
<!-- theme: creative -->
# Presentation Title
## Subtitle

---

## Agenda
- Topic 1
- Topic 2
- Topic 3

---

<!-- theme: dark -->
## Key Metrics
| Metric | Value | Change |
|--------|-------|--------|
| Users | 10K | +25% |
| Revenue | $1M | +15% |

---

## Summary
- Main takeaway 1
- Main takeaway 2

> Remember: keep it concise and visual

---

## Thank You
### Questions?`,
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
