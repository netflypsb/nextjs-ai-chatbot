import { smoothStream, streamText } from "ai";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { getArtifactModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const webviewDocumentHandler = createDocumentHandler<"webview">({
  kind: "webview",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: getArtifactModel(),
      system: `You are a creative web designer. Generate a complete, self-contained HTML document.

Rules:
- Output a single, complete HTML document with <!DOCTYPE html>
- Include all CSS inline in a <style> tag in <head>
- Include all JavaScript inline in a <script> tag before </body>
- Use modern CSS: flexbox, grid, gradients, animations, shadows
- Make it visually stunning and professional
- Ensure it works standalone with no external dependencies (except CDN fonts/icons if needed)
- Use responsive design principles
- For infographics: use SVG or CSS for graphics
- For dashboards: use CSS grid layouts with cards
- For banners/posters: use bold typography and gradients
- For interactive content: add smooth CSS animations and JS interactivity

Content types you can create:
- Banners and posters with bold typography
- Infographics with data visualization (SVG/CSS)
- Interactive dashboards with cards and charts
- Landing pages and hero sections
- Data visualization with CSS/SVG charts
- Artistic designs and creative layouts`,
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;
        draftContent += text;

        dataStream.write({
          type: "data-webviewDelta",
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
      system: updateDocumentPrompt(document.content, "webview"),
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: description,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;
        draftContent += text;

        dataStream.write({
          type: "data-webviewDelta",
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});
