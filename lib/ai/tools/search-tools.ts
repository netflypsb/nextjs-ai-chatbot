import { tool } from "ai";
import { z } from "zod";

const TOOL_CATALOG = [
  {
    name: "agentBrowserNavigate",
    category: "Browser Automation",
    description:
      "Navigate to a URL using the AI browser. Returns an accessibility snapshot with interactive element references (@e1, @e2). Use for: web browsing, search engine queries, reading dynamic pages.",
    parameters:
      "url (string, required): The URL to navigate to",
    usage:
      'agentBrowserNavigate({ url: "https://google.com/search?q=query" })',
    relatedSkill: "agent-browser",
  },
  {
    name: "agentBrowserInteract",
    category: "Browser Automation",
    description:
      "Interact with elements on the current browser page using refs from a snapshot. Supports click, fill, type, hover, check, uncheck. Returns updated snapshot after interaction.",
    parameters:
      "action (enum: click|fill|type|hover|check|uncheck), ref (string: element ref like '@e1'), value (string, optional: text for fill/type)",
    usage: 'agentBrowserInteract({ action: "click", ref: "@e3" })',
    relatedSkill: "agent-browser",
  },
  {
    name: "agentBrowserExtract",
    category: "Browser Automation",
    description:
      "Extract content from the current browser page or specific element. Returns text, HTML, input value, or accessibility snapshot.",
    parameters:
      "ref (string, optional: element ref), extractType (enum: text|html|value|snapshot, default: text)",
    usage: 'agentBrowserExtract({ extractType: "text" })',
    relatedSkill: "agent-browser",
  },
  {
    name: "agentBrowserClose",
    category: "Browser Automation",
    description:
      "Close the current browser session and free resources. Always call when done with browser automation.",
    parameters: "none",
    usage: "agentBrowserClose()",
    relatedSkill: "agent-browser",
  },
  {
    name: "browseWeb",
    category: "Web Content",
    description:
      "Browse a URL and extract its text content using Browserbase cloud browser. Returns up to 15,000 chars of readable text. Use for reading articles, docs, known URLs. Simpler and faster than agent-browser.",
    parameters: "url (string, required): The URL to browse",
    usage: 'browseWeb({ url: "https://docs.example.com/api" })',
    relatedSkill: "browserbase",
  },
  {
    name: "executeCode",
    category: "Code Execution",
    description:
      "Execute Python code in a secure E2B sandbox with internet access. Supports pip package installation. Can generate downloadable files (PPTX, DOCX, XLSX, PDF). Returns stdout, stderr, generated files as base64, and chart images.",
    parameters:
      "code (string, required): Python code to execute. installPackages (string[], optional): pip packages to install first.",
    usage:
      'executeCode({ code: \'print(2+2)\', installPackages: ["pandas"] })',
    relatedSkill: null,
  },
  {
    name: "getWeather",
    category: "Utility",
    description:
      "Get current weather information for a location. Returns temperature, conditions, humidity, wind.",
    parameters:
      "city (string, optional), latitude/longitude (numbers, optional)",
    usage: 'getWeather({ city: "San Francisco" })',
    relatedSkill: null,
  },
];

export const searchTools = tool({
  description:
    "Search for available tools by name, category, or capability. Returns full descriptions, parameters, and usage examples for matching tools. Use this to discover tools for tasks like web browsing, code execution, or other capabilities not described in your core instructions.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search query (e.g. 'browser', 'code execution', 'weather', 'web')"
      ),
  }),
  execute: async ({ query }) => {
    const q = query.toLowerCase();
    const results = TOOL_CATALOG.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );

    if (results.length === 0) {
      return {
        query,
        results: [],
        allCategories: [...new Set(TOOL_CATALOG.map((t) => t.category))],
        message: "No matching tools found. Try searching by category.",
      };
    }

    return {
      query,
      results: results.map((t) => ({
        name: t.name,
        category: t.category,
        description: t.description,
        parameters: t.parameters,
        usage: t.usage,
        relatedSkill: t.relatedSkill
          ? `Load skill '${t.relatedSkill}' with readSkill for expert guidance`
          : null,
      })),
    };
  },
});
