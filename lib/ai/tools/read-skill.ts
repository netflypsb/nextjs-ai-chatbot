import { tool } from "ai";
import { z } from "zod";
import { getSkillContent, SKILL_REGISTRY } from "@/lib/ai/skills";

export const readSkill = tool({
  description:
    "Load a skill to gain expert knowledge for a specific domain. Skills provide detailed instructions, best practices, and patterns. Use this BEFORE attempting tasks that match a skill's domain. Available skills are listed in your system prompt.",
  inputSchema: z.object({
    skillId: z
      .string()
      .describe(
        "The skill ID to load (e.g. 'agent-browser', 'online-research', 'presentation')"
      ),
  }),
  execute: async ({ skillId }) => {
    const skill = SKILL_REGISTRY.find((s) => s.id === skillId);
    if (!skill) {
      return {
        error: `Skill '${skillId}' not found. Available: ${SKILL_REGISTRY.map((s) => s.id).join(", ")}`,
      };
    }
    const content = getSkillContent(skillId);
    if (!content) {
      return { error: `Failed to load skill content for '${skillId}'` };
    }
    return {
      skillId,
      name: skill.name,
      content,
    };
  },
});
