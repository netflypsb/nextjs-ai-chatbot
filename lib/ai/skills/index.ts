import fs from "node:fs";
import path from "node:path";

export type SkillMetadata = {
  id: string;
  name: string;
  description: string;
  triggers: string[];
};

export const SKILL_REGISTRY: SkillMetadata[] = [
  {
    id: "agent-browser",
    name: "Agent Browser Specialist",
    description:
      "Expert guidance on using agent-browser tools (navigate, interact, extract, close). Covers the ref/snapshot system, page interaction patterns, and debugging strategies.",
    triggers: [
      "browse",
      "navigate",
      "click",
      "web page",
      "scrape",
      "agent-browser",
      "snapshot",
    ],
  },
  {
    id: "browserbase",
    name: "Browserbase Specialist",
    description:
      "Expert guidance on using browseWeb tool powered by Browserbase. Covers session management, content extraction, and when to use Browserbase vs agent-browser.",
    triggers: [
      "browserbase",
      "browseWeb",
      "extract content",
      "read page",
      "fetch page",
    ],
  },
  {
    id: "online-research",
    name: "Online Research Specialist",
    description:
      "Best practices for conducting effective online research. Covers search strategies, query refinement, source evaluation, iterative research patterns, and synthesizing findings.",
    triggers: [
      "research",
      "search",
      "find information",
      "look up",
      "investigate",
      "current events",
    ],
  },
  {
    id: "web-tools",
    name: "Web Tools Specialist",
    description:
      "Guide for selecting and using the right web tool for each task. Covers when to use agent-browser vs browseWeb, tool selection decision tree, and common web automation patterns.",
    triggers: [
      "web tool",
      "which tool",
      "browser tool",
      "automation",
      "web browsing",
    ],
  },
  {
    id: "presentation",
    name: "Presentation Design Specialist",
    description:
      "Expert at creating beautiful, interactive slide presentations. Covers theme selection, visual hierarchy, content structure, markdown formatting for slides, and download optimization.",
    triggers: [
      "presentation",
      "slides",
      "slide deck",
      "powerpoint",
      "pptx",
      "slide",
    ],
  },
];

export function getSkillContent(skillId: string): string | null {
  try {
    const filePath = path.join(
      process.cwd(),
      "lib",
      "ai",
      "skills",
      `${skillId}.md`
    );
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function searchSkillsByQuery(query: string): SkillMetadata[] {
  const q = query.toLowerCase();
  return SKILL_REGISTRY.filter(
    (skill) =>
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.triggers.some((t) => q.includes(t) || t.includes(q))
  );
}

export function getSkillMetadataPrompt(): string {
  return SKILL_REGISTRY.map(
    (s) => `- **${s.name}** (id: \`${s.id}\`): ${s.description}`
  ).join("\n");
}
