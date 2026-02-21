import { tool } from "ai";
import { z } from "zod";
import { SKILL_REGISTRY, searchSkillsByQuery } from "@/lib/ai/skills";

export const searchSkills = tool({
  description:
    "Search for relevant skills by keyword or topic. Returns matching skill metadata. Use this when you're unsure which skill to load for a task.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search query (e.g. 'browser automation', 'research', 'slides')"
      ),
  }),
  execute: async ({ query }) => {
    const results = searchSkillsByQuery(query);
    if (results.length === 0) {
      return {
        query,
        results: [],
        allSkills: SKILL_REGISTRY.map((s) => ({ id: s.id, name: s.name })),
        message: "No matching skills found. Here are all available skills.",
      };
    }
    return {
      query,
      results: results.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
      })),
    };
  },
});
