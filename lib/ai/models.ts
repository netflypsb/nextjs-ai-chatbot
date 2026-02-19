// OpenRouter models configured for Solaris Web
export const DEFAULT_CHAT_MODEL = "z-ai/glm-4.7-flash";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // Z-AI (Zhipu)
  {
    id: "z-ai/glm-5",
    name: "GLM-5",
    provider: "z-ai",
    description: "Most capable Zhipu model",
  },
  {
    id: "z-ai/glm-4.7",
    name: "GLM-4.7",
    provider: "z-ai",
    description: "Strong general-purpose model",
  },
  {
    id: "z-ai/glm-4.7-flash",
    name: "GLM-4.7 Flash",
    provider: "z-ai",
    description: "Fast and cost-effective",
  },
  {
    id: "z-ai/glm-4.6v",
    name: "GLM-4.6V",
    provider: "z-ai",
    description: "Vision-capable model",
  },
  // MiniMax
  {
    id: "minimax/minimax-m2.5",
    name: "MiniMax M2.5",
    provider: "minimax",
    description: "Powerful multilingual model",
  },
  // Qwen
  {
    id: "qwen/qwen3-max-thinking",
    name: "Qwen3 Max Thinking",
    provider: "qwen",
    description: "Extended reasoning for complex problems",
  },
  // Moonshot
  {
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "moonshot",
    description: "Advanced reasoning and long-context model",
  },
  // DeepSeek
  {
    id: "deepseek/deepseek-v3.2-speciale",
    name: "DeepSeek V3.2 Speciale",
    provider: "deepseek",
    description: "High-performance reasoning model",
  },
  // xAI
  {
    id: "x-ai/grok-4.1-fast",
    name: "Grok 4.1 Fast",
    provider: "xai",
    description: "Fast inference with strong capabilities",
  },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
