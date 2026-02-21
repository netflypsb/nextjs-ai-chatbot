import { tool } from "ai";
import { z } from "zod";

let browserInstance: any = null;
let commandId = 0;

function nextId() {
  commandId++;
  return String(commandId);
}

async function getBrowser() {
  if (!browserInstance) {
    // Dynamic import to avoid Next.js bundling playwright-core at build time
    const mod = await import("agent-browser/dist/browser");
    const { BrowserManager } = mod;
    browserInstance = new BrowserManager();
    await browserInstance.launch({ headless: true });
  }
  return browserInstance;
}

async function runCommand(command: Record<string, unknown>) {
  const browser = await getBrowser();
  const actionsMod = await import("agent-browser/dist/actions");
  const protoMod = await import("agent-browser/dist/protocol");
  const response = await actionsMod.executeCommand(command as any, browser);
  return protoMod.serializeResponse(response);
}

async function cleanupBrowser() {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (_) {
      // ignore cleanup errors
    }
    browserInstance = null;
  }
}

function truncate(val: unknown, max = 12_000): string {
  const str = typeof val === "string" ? val : JSON.stringify(val);
  return str.length > max ? str.slice(0, max) : str;
}

/**
 * Navigate to a URL and return an interactive snapshot of the page.
 * The snapshot includes element refs (like @e1, @e2) that can be used
 * with agentBrowserInteract and agentBrowserExtract.
 */
export const agentBrowserNavigate = tool({
  description:
    "Navigate to a URL using the AI browser and return a snapshot of the page with interactive element references. Use this for browsing websites, reading content, and preparing for interactions. Returns an accessibility tree with element refs like @e1, @e2 that can be used with agentBrowserInteract and agentBrowserExtract.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to navigate to"),
  }),
  execute: async ({ url }) => {
    try {
      // Navigate
      await runCommand({ id: nextId(), action: "navigate", url });

      // Wait for page to settle
      await new Promise((r) => setTimeout(r, 1500));

      // Get interactive snapshot
      const snapshot = await runCommand({
        id: nextId(),
        action: "snapshot",
        interactive: true,
      });

      return {
        url,
        snapshot: truncate(snapshot),
        method: "agent-browser",
      };
    } catch (error) {
      await cleanupBrowser();
      return {
        error: `Failed to navigate to ${url}: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

/**
 * Interact with elements on the current page using refs from a snapshot.
 */
export const agentBrowserInteract = tool({
  description:
    "Interact with elements on the current browser page using element refs from a previous snapshot. Supports click, fill (for inputs), type (character by character), hover, and check/uncheck actions. After interaction, returns an updated snapshot.",
  inputSchema: z.object({
    action: z
      .enum(["click", "fill", "type", "hover", "check", "uncheck"])
      .describe("The interaction type to perform"),
    ref: z
      .string()
      .describe("Element reference from snapshot (e.g. '@e1', '@e2')"),
    value: z
      .string()
      .optional()
      .describe("Value for fill/type actions (text to enter)"),
  }),
  execute: async ({ action, ref, value }) => {
    try {
      const cmd: Record<string, unknown> = {
        id: nextId(),
        action,
        selector: ref,
      };

      if ((action === "fill" || action === "type") && value) {
        cmd.value = value;
      }

      await runCommand(cmd);

      // Wait for any page updates
      await new Promise((r) => setTimeout(r, 800));

      // Return updated snapshot
      const snapshot = await runCommand({
        id: nextId(),
        action: "snapshot",
        interactive: true,
      });

      return {
        action,
        ref,
        success: true,
        snapshot: truncate(snapshot),
      };
    } catch (error) {
      return {
        error: `Failed to ${action} on ${ref}: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

/**
 * Extract text or HTML content from elements on the current page.
 */
export const agentBrowserExtract = tool({
  description:
    "Extract text content from the current browser page or from a specific element using its ref. Use this to read page content, get form values, or extract specific data from elements.",
  inputSchema: z.object({
    ref: z
      .string()
      .optional()
      .describe(
        "Element reference to extract from (e.g. '@e1'). If omitted, extracts full page text."
      ),
    extractType: z
      .enum(["text", "html", "value", "snapshot"])
      .default("text")
      .describe(
        "What to extract: 'text' for visible text, 'html' for innerHTML, 'value' for input values, 'snapshot' for accessibility tree"
      ),
  }),
  execute: async ({ ref, extractType }) => {
    try {
      if (extractType === "snapshot") {
        const snapshot = await runCommand({
          id: nextId(),
          action: "snapshot",
        });
        return { content: truncate(snapshot, 15_000), type: "snapshot" };
      }

      const cmd: Record<string, unknown> = {
        id: nextId(),
        action: "get",
        what: extractType,
      };

      if (ref) {
        cmd.selector = ref;
      }

      const result = await runCommand(cmd);
      return {
        ref: ref || "page",
        content: truncate(result, 15_000),
        type: extractType,
      };
    } catch (error) {
      return {
        error: `Failed to extract ${extractType} from ${ref || "page"}: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

/**
 * Close the browser session and cleanup resources.
 */
export const agentBrowserClose = tool({
  description:
    "Close the current browser session and cleanup resources. Call this when you're done with browser automation to free resources.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      await cleanupBrowser();
      return { success: true, message: "Browser session closed" };
    } catch (error) {
      return {
        error: `Failed to close browser: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
