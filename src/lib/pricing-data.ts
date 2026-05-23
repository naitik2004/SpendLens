import type { ToolId, UseCase } from "@/types";

export interface PlanInfo {
  id: string;
  label: string;
  pricePerSeatPerMonth: number; // official price
  minSeats?: number;
  maxSeats?: number;
  bestFor: UseCase[];
  notes?: string;
}

export interface ToolInfo {
  id: ToolId;
  name: string;
  plans: PlanInfo[];
  category: "ai_assistant" | "code_assistant" | "api" | "platform";
  sourceUrl: string;
}

export const TOOLS: ToolInfo[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "code_assistant",
    sourceUrl: "https://www.cursor.com/pricing",
    plans: [
      {
        id: "hobby",
        label: "Hobby",
        pricePerSeatPerMonth: 0,
        bestFor: ["coding"],
        notes: "Limited completions, 2000/month",
      },
      {
        id: "pro",
        label: "Pro",
        pricePerSeatPerMonth: 20,
        bestFor: ["coding"],
        notes: "Unlimited completions, GPT-4, Claude",
      },
      {
        id: "business",
        label: "Business",
        pricePerSeatPerMonth: 40,
        minSeats: 1,
        bestFor: ["coding"],
        notes: "Team features, SSO, admin controls",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeatPerMonth: 100,
        minSeats: 20,
        bestFor: ["coding"],
        notes: "Custom contract, SLAs",
      },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "code_assistant",
    sourceUrl: "https://github.com/features/copilot#pricing",
    plans: [
      {
        id: "individual",
        label: "Individual",
        pricePerSeatPerMonth: 10,
        bestFor: ["coding"],
        notes: "Free for verified students/OSS maintainers",
      },
      {
        id: "business",
        label: "Business",
        pricePerSeatPerMonth: 19,
        bestFor: ["coding"],
        notes: "Org-wide policy management",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeatPerMonth: 39,
        bestFor: ["coding"],
        notes: "Fine-tuned models on your codebase",
      },
    ],
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "ai_assistant",
    sourceUrl: "https://www.anthropic.com/pricing",
    plans: [
      {
        id: "free",
        label: "Free",
        pricePerSeatPerMonth: 0,
        bestFor: ["writing", "research", "mixed"],
        notes: "Rate limited, Claude 3.5 Sonnet",
      },
      {
        id: "pro",
        label: "Pro",
        pricePerSeatPerMonth: 20,
        bestFor: ["writing", "research", "data", "mixed"],
        notes: "5x more usage, projects, priority",
      },
      {
        id: "max",
        label: "Max",
        pricePerSeatPerMonth: 100,
        bestFor: ["writing", "research", "data", "mixed"],
        notes: "20x more usage than Pro",
      },
      {
        id: "team",
        label: "Team",
        pricePerSeatPerMonth: 30,
        minSeats: 2,
        bestFor: ["writing", "research", "mixed"],
        notes: "Shared projects, admin, 25+ seat discounts",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeatPerMonth: 60,
        minSeats: 10,
        bestFor: ["mixed", "data", "research"],
        notes: "Custom context, SSO, audit logs",
      },
      {
        id: "api",
        label: "API Direct",
        pricePerSeatPerMonth: 0,
        bestFor: ["coding", "data"],
        notes: "Pay per token — highly variable",
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "ai_assistant",
    sourceUrl: "https://openai.com/chatgpt/pricing",
    plans: [
      {
        id: "plus",
        label: "Plus",
        pricePerSeatPerMonth: 20,
        bestFor: ["writing", "research", "mixed"],
        notes: "GPT-4o, DALL-E, voice mode",
      },
      {
        id: "team",
        label: "Team",
        pricePerSeatPerMonth: 30,
        minSeats: 2,
        bestFor: ["writing", "research", "mixed"],
        notes: "Shared workspace, admin console",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeatPerMonth: 60,
        minSeats: 10,
        bestFor: ["mixed", "data"],
        notes: "Custom context window, SOC 2, SSO",
      },
      {
        id: "api",
        label: "API Direct",
        pricePerSeatPerMonth: 0,
        bestFor: ["coding", "data"],
        notes: "Pay per token",
      },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "api",
    sourceUrl: "https://www.anthropic.com/api",
    plans: [
      {
        id: "pay_as_you_go",
        label: "Pay As You Go",
        pricePerSeatPerMonth: 0,
        bestFor: ["coding", "data"],
        notes: "Per-token billing, Claude 3.5 Sonnet $3/$15 per M tokens",
      },
    ],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    sourceUrl: "https://openai.com/api/pricing",
    plans: [
      {
        id: "pay_as_you_go",
        label: "Pay As You Go",
        pricePerSeatPerMonth: 0,
        bestFor: ["coding", "data"],
        notes: "Per-token billing, GPT-4o $5/$15 per M tokens",
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    category: "ai_assistant",
    sourceUrl: "https://one.google.com/about/google-ai-premium",
    plans: [
      {
        id: "free",
        label: "Free",
        pricePerSeatPerMonth: 0,
        bestFor: ["writing", "research"],
        notes: "Gemini 1.5 Flash, rate limited",
      },
      {
        id: "advanced",
        label: "Advanced (AI Premium)",
        pricePerSeatPerMonth: 20,
        bestFor: ["writing", "research", "mixed"],
        notes: "Gemini 1.5 Pro, 2M context, includes Google One 2TB",
      },
      {
        id: "api",
        label: "API Direct",
        pricePerSeatPerMonth: 0,
        bestFor: ["coding", "data"],
        notes: "Per-token, free tier available",
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    category: "code_assistant",
    sourceUrl: "https://codeium.com/pricing",
    plans: [
      {
        id: "free",
        label: "Free",
        pricePerSeatPerMonth: 0,
        bestFor: ["coding"],
        notes: "Basic completions, Cascade Flows limited",
      },
      {
        id: "pro",
        label: "Pro",
        pricePerSeatPerMonth: 15,
        bestFor: ["coding"],
        notes: "Unlimited Flows, Claude + GPT-4 models",
      },
      {
        id: "teams",
        label: "Teams",
        pricePerSeatPerMonth: 35,
        minSeats: 2,
        bestFor: ["coding"],
        notes: "Shared context, admin, analytics",
      },
    ],
  },
];

export function getToolById(id: ToolId): ToolInfo | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function getPlanById(toolId: ToolId, planId: string): PlanInfo | undefined {
  const tool = getToolById(toolId);
  return tool?.plans.find((p) => p.id === planId);
}
