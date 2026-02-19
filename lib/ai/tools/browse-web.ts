import Browserbase from "@browserbasehq/sdk";
import { tool } from "ai";
import { z } from "zod";

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

export const browseWeb = tool({
  description:
    "Browse a web page and extract its text content. Use this to read articles, documentation, web pages, or gather information from any URL. Returns the readable text content of the page.",
  inputSchema: z.object({
    url: z
      .string()
      .url()
      .describe("The URL to browse and extract content from"),
  }),
  execute: async ({ url }) => {
    try {
      const session = await bb.sessions.create({
        projectId: process.env.BROWSERBASE_PROJECT_ID || "",
      });

      const response = await fetch(
        `https://connect.browserbase.com/v1/sessions/${session.id}/content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-bb-api-key": process.env.BROWSERBASE_API_KEY || "",
          },
          body: JSON.stringify({
            url,
            wait: true,
            textContent: true,
          }),
        }
      );

      if (!response.ok) {
        // Fallback: use simple fetch with text extraction
        const pageResponse = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        const html = await pageResponse.text();
        // Strip HTML tags for basic text extraction
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        return {
          url,
          content: text.slice(0, 15_000),
          method: "fallback",
        };
      }

      const data = await response.json();
      return {
        url,
        content:
          typeof data === "string"
            ? data.slice(0, 15_000)
            : JSON.stringify(data).slice(0, 15_000),
        sessionId: session.id,
        method: "browserbase",
      };
    } catch (error) {
      // Final fallback: simple fetch
      try {
        const pageResponse = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        const html = await pageResponse.text();
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        return {
          url,
          content: text.slice(0, 15_000),
          method: "fetch-fallback",
        };
      } catch (_fetchError) {
        return {
          error: `Failed to browse ${url}: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    }
  },
});
