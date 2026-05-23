export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  monthlySpend: number; // what they actually pay
  seats: number;
}

export interface FormState {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface AuditRecommendation {
  toolId: ToolId;
  currentPlan: string;
  currentSpend: number;
  seats: number;
  recommendedAction: string;
  recommendedPlan?: string;
  estimatedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  isOptimal: boolean;
}

export interface AuditResult {
  id: string;
  createdAt: string;
  recommendations: AuditRecommendation[];
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary: string;
  useCase: UseCase;
  teamSize: number;
  isHighSavings: boolean; // >$500/mo savings
}

export interface LeadData {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}

export interface ShareableAudit {
  id: string;
  createdAt: string;
  recommendations: Pick<
    AuditRecommendation,
    | "toolId"
    | "currentPlan"
    | "monthlySavings"
    | "annualSavings"
    | "recommendedAction"
    | "isOptimal"
  >[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  useCase: UseCase;
  teamSize: number;
}
