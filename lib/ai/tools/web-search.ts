import { tool } from "ai";
import { z } from "zod";

export const webSearch = tool({
  description:
    "Search the internet for current information. Use this to find up-to-date facts, news, documentation, tutorials, or any information not in your training data. Returns search results with titles, URLs, and snippets.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    numResults: z
      .number()
      .optional()
      .default(5)
      .describe("Number of results to return (default 5)"),
  }),
  execute: async ({ query, numResults }) => {
    try {
      // Use Browserbase's search API if available, otherwise fall back to a simple approach
      const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${numResults}`;

      const response = await fetch(searchUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const results = (data.web?.results || [])
          .slice(0, numResults)
          .map((r: { title: string; url: string; description: string }) => ({
            title: r.title,
            url: r.url,
            snippet: r.description,
          }));

        return {
          query,
          results,
          count: results.length,
        };
      }

      // Fallback: use DuckDuckGo instant answer API
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
      const ddgResponse = await fetch(ddgUrl);
      const ddgData = await ddgResponse.json();

      const results: { title: string; url: string; snippet: string }[] = [];
      if (ddgData.AbstractText) {
        results.push({
          title: ddgData.Heading || query,
          url: ddgData.AbstractURL || "",
          snippet: ddgData.AbstractText,
        });
      }
      for (const topic of ddgData.RelatedTopics?.slice(0, numResults - 1) ||
        []) {
        if (topic.Text) {
          results.push({
            title: topic.Text.slice(0, 100),
            url: topic.FirstURL || "",
            snippet: topic.Text,
          });
        }
      }

      return {
        query,
        results,
        count: results.length,
      };
    } catch (error) {
      return {
        error: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        query,
      };
    }
  },
});
