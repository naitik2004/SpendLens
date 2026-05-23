import type { ToolEntry, AuditRecommendation, AuditResult, UseCase } from "@/types";
import { getToolById, getPlanById } from "./pricing-data";
import { nanoid } from "nanoid";

// ─── Plan-fit rules ─────────────────────────────────────────────────────────
// Each rule returns a recommendation or null if nothing to flag.

function evaluateCursor(entry: ToolEntry, teamSize: number, useCase: UseCase): AuditRecommendation {
  const tool = getToolById("cursor")!;
  const current = getPlanById("cursor", entry.plan);
  const base: Omit<AuditRecommendation, "monthlySavings" | "annualSavings"> = {
    toolId: "cursor",
    currentPlan: current?.label ?? entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    recommendedAction: "",
    estimatedMonthlyCost: entry.monthlySpend,
    reason: "",
    isOptimal: false,
  };

  // Business plan for ≤2 users: overkill, Pro is identical feature-wise for individuals
  if (entry.plan === "business" && entry.seats <= 2) {
    const proCost = 20 * entry.seats;
    const savings = entry.monthlySpend - proCost;
    return {
      ...base,
      recommendedAction: "Downgrade to Pro",
      recommendedPlan: "pro",
      estimatedMonthlyCost: proCost,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Business plan costs $40/seat vs $20 for Pro. With ${entry.seats} user(s), you get identical coding features. Business is only worth it for SSO, SAML, and enforced org-wide policies — none of which matter at your team size.`,
      isOptimal: savings <= 0,
    };
  }

  // Cursor for non-coding use cases
  if (useCase !== "coding" && useCase !== "mixed") {
    return {
      ...base,
      recommendedAction: "Consider cancelling Cursor",
      estimatedMonthlyCost: 0,
      monthlySavings: entry.monthlySpend,
      annualSavings: entry.monthlySpend * 12,
      reason: `Cursor is purpose-built for code completion. Your primary use case is ${useCase}. Tools like Claude Pro or ChatGPT Plus do the same writing/research work better at a comparable or lower price per seat.`,
      isOptimal: false,
    };
  }

  // Enterprise for small teams
  if (entry.plan === "enterprise" && entry.seats < 20) {
    const businessCost = 40 * entry.seats;
    const savings = entry.monthlySpend - businessCost;
    if (savings > 0) {
      return {
        ...base,
        recommendedAction: "Switch to Business plan",
        recommendedPlan: "business",
        estimatedMonthlyCost: businessCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Enterprise contracts typically have a 20-seat minimum and custom pricing. If you're under 20 seats, you may be overpaying versus the $40/seat Business plan, which includes SSO and admin tools already.`,
        isOptimal: false,
      };
    }
  }

  // Also: Windsurf Pro is $15 vs Cursor Pro $20 — flag for budget-sensitive teams
  if (entry.plan === "pro" && entry.monthlySpend > 60) {
    const windsurfCost = 15 * entry.seats;
    const savings = entry.monthlySpend - windsurfCost;
    return {
      ...base,
      recommendedAction: "Evaluate Windsurf Pro as an alternative",
      estimatedMonthlyCost: windsurfCost,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Windsurf Pro at $15/seat vs Cursor Pro at $20/seat. Both offer Claude and GPT-4 models, unlimited completions, and multi-file editing. The primary difference is UX preference — worth a 2-week trial before your next billing cycle.`,
      isOptimal: false,
    };
  }

  return {
    ...base,
    recommendedAction: "No changes needed",
    monthlySavings: 0,
    annualSavings: 0,
    reason: `Your current Cursor ${current?.label} plan is appropriate for your team of ${entry.seats} with a coding-focused workflow.`,
    isOptimal: true,
  };
}

function evaluateGithubCopilot(entry: ToolEntry, teamSize: number, useCase: UseCase): AuditRecommendation {
  const current = getPlanById("github_copilot", entry.plan);
  const base: Omit<AuditRecommendation, "monthlySavings" | "annualSavings"> = {
    toolId: "github_copilot",
    currentPlan: current?.label ?? entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    recommendedAction: "",
    estimatedMonthlyCost: entry.monthlySpend,
    reason: "",
    isOptimal: false,
  };

  // Using Cursor AND Copilot — double-paying
  return {
    ...base,
    recommendedAction: "Evaluate overlap with Cursor",
    monthlySavings: 0,
    annualSavings: 0,
    reason: `GitHub Copilot ${current?.label} at $${current?.pricePerSeatPerMonth}/seat is well-priced for what it does. However, if you're also running Cursor, you're paying for two code assistants simultaneously. Most teams find one sufficient — pick the one your devs prefer and cancel the other.`,
    isOptimal: entry.plan === "individual",
  };
}

function evaluateClaude(entry: ToolEntry, teamSize: number, useCase: UseCase): AuditRecommendation {
  const current = getPlanById("claude", entry.plan);
  const base: Omit<AuditRecommendation, "monthlySavings" | "annualSavings"> = {
    toolId: "claude",
    currentPlan: current?.label ?? entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    recommendedAction: "",
    estimatedMonthlyCost: entry.monthlySpend,
    reason: "",
    isOptimal: false,
  };

  // Team for 2 users is more expensive than individual Pro plans
  if (entry.plan === "team" && entry.seats <= 2) {
    const proCost = 20 * entry.seats;
    const savings = entry.monthlySpend - proCost;
    if (savings > 0) {
      return {
        ...base,
        recommendedAction: "Switch to individual Pro plans",
        recommendedPlan: "pro",
        estimatedMonthlyCost: proCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Claude Team costs $30/seat vs $20 for Pro. With only ${entry.seats} users, you get no meaningful benefit from Team features (shared projects, admin console) that justify the $${savings}/month premium. Individual Pro plans give the same model access and usage limits.`,
        isOptimal: false,
      };
    }
  }

  // Max plan — flag if usage doesn't justify it
  if (entry.plan === "max" && entry.seats === 1) {
    const savings = entry.monthlySpend - 20;
    return {
      ...base,
      recommendedAction: "Consider downgrading to Pro",
      recommendedPlan: "pro",
      estimatedMonthlyCost: 20,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Claude Max at $100/seat gives 20x the usage limits of Pro ($20). Unless you're consistently hitting Pro's caps (which requires extremely heavy daily usage — think 8+ hours of active prompting), Pro is sufficient and saves $${savings}/month per seat.`,
      isOptimal: false,
    };
  }

  return {
    ...base,
    recommendedAction: "No changes needed",
    monthlySavings: 0,
    annualSavings: 0,
    reason: `Claude ${current?.label} is appropriately sized for your ${useCase} use case with ${entry.seats} seat(s).`,
    isOptimal: true,
  };
}

function evaluateChatGPT(entry: ToolEntry, teamSize: number, useCase: UseCase): AuditRecommendation {
  const current = getPlanById("chatgpt", entry.plan);
  const base: Omit<AuditRecommendation, "monthlySavings" | "annualSavings"> = {
    toolId: "chatgpt",
    currentPlan: current?.label ?? entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    recommendedAction: "",
    estimatedMonthlyCost: entry.monthlySpend,
    reason: "",
    isOptimal: false,
  };

  // Running both Claude Pro and ChatGPT Plus — likely redundant
  return {
    ...base,
    recommendedAction: "Audit for redundancy with Claude",
    monthlySavings: 0,
    annualSavings: 0,
    reason: `ChatGPT ${current?.label} at $${current?.pricePerSeatPerMonth}/seat has equivalent capability to Claude Pro for most ${useCase} tasks. If you're subscribed to both, you're likely paying double for the same work. Pick a primary and cancel the other — saving $20/seat/month.`,
    isOptimal: entry.plan === "plus" && entry.seats === 1,
  };
}

function evaluateAPI(entry: ToolEntry): AuditRecommendation {
  const toolName = entry.toolId === "anthropic_api" ? "Anthropic" : "OpenAI";
  return {
    toolId: entry.toolId,
    currentPlan: "Pay As You Go",
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    recommendedAction: entry.monthlySpend > 200 ? "Review usage patterns" : "No changes needed",
    estimatedMonthlyCost: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason:
      entry.monthlySpend > 200
        ? `At $${entry.monthlySpend}/month on the ${toolName} API, consider whether a hosted subscription plan (Claude Pro / ChatGPT Plus) at $20/user/month might cover your use case more predictably. API billing has no cap and can spike unexpectedly.`
        : `Your ${toolName} API spend at $${entry.monthlySpend}/month is modest. Pay-as-you-go is appropriate at this volume.`,
    isOptimal: entry.monthlySpend <= 200,
  };
}

function evaluateGemini(entry: ToolEntry, useCase: UseCase): AuditRecommendation {
  const current = getPlanById("gemini", entry.plan);
  const base: Omit<AuditRecommendation, "monthlySavings" | "annualSavings"> = {
    toolId: "gemini",
    currentPlan: current?.label ?? entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    recommendedAction: "",
    estimatedMonthlyCost: entry.monthlySpend,
    reason: "",
    isOptimal: false,
  };

  if (entry.plan === "advanced") {
    return {
      ...base,
      recommendedAction: "Compare with Claude Pro",
      monthlySavings: 0,
      annualSavings: 0,
      reason: `Gemini Advanced at $20/seat is priced identically to Claude Pro and ChatGPT Plus. The included Google One 2TB storage is genuine value if you use Google Drive heavily. If you don't rely on the Google ecosystem, Claude Pro or ChatGPT Plus may deliver better ${useCase} output — worth a trial month.`,
      isOptimal: true,
    };
  }

  return {
    ...base,
    recommendedAction: "No changes needed",
    monthlySavings: 0,
    annualSavings: 0,
    reason: "Free Gemini tier is good for supplemental use. No spend to optimize.",
    isOptimal: true,
  };
}

function evaluateWindsurf(entry: ToolEntry, teamSize: number): AuditRecommendation {
  const current = getPlanById("windsurf", entry.plan);
  const base: Omit<AuditRecommendation, "monthlySavings" | "annualSavings"> = {
    toolId: "windsurf",
    currentPlan: current?.label ?? entry.plan,
    currentSpend: entry.monthlySpend,
    seats: entry.seats,
    recommendedAction: "",
    estimatedMonthlyCost: entry.monthlySpend,
    reason: "",
    isOptimal: false,
  };

  return {
    ...base,
    recommendedAction: "No changes needed",
    monthlySavings: 0,
    annualSavings: 0,
    reason: `Windsurf ${current?.label} at $${current?.pricePerSeatPerMonth}/seat is one of the most competitive code assistant prices available. If you're getting value from it, this is money well spent.`,
    isOptimal: true,
  };
}

// ─── Overlap detection ────────────────────────────────────────────────────────
function applyOverlapPenalties(
  entries: ToolEntry[],
  recs: AuditRecommendation[]
): AuditRecommendation[] {
  const hasCursor = entries.some((e) => e.toolId === "cursor" && e.monthlySpend > 0);
  const hasCopilot = entries.some((e) => e.toolId === "github_copilot" && e.monthlySpend > 0);
  const hasWindsurf = entries.some((e) => e.toolId === "windsurf" && e.monthlySpend > 0);
  const hasClaude = entries.some((e) => e.toolId === "claude" && e.monthlySpend > 0);
  const hasChatGPT = entries.some((e) => e.toolId === "chatgpt" && e.monthlySpend > 0);

  const codeAssistantCount = [hasCursor, hasCopilot, hasWindsurf].filter(Boolean).length;
  const generalAICount = [hasClaude, hasChatGPT].filter(Boolean).length;

  return recs.map((rec) => {
    if (
      codeAssistantCount >= 2 &&
      (rec.toolId === "cursor" || rec.toolId === "github_copilot" || rec.toolId === "windsurf")
    ) {
      const cheapestCode = entries
        .filter((e) => ["cursor", "github_copilot", "windsurf"].includes(e.toolId))
        .sort((a, b) => a.monthlySpend - b.monthlySpend)[0];
      if (rec.toolId !== cheapestCode.toolId && rec.monthlySavings === 0) {
        return {
          ...rec,
          recommendedAction: "Consider consolidating code assistants",
          reason: `You're running ${codeAssistantCount} code assistants simultaneously. Most engineering teams consolidate to one. ${rec.reason}`,
        };
      }
    }

    if (generalAICount >= 2 && (rec.toolId === "claude" || rec.toolId === "chatgpt")) {
      return {
        ...rec,
        reason: `Note: You're subscribed to both Claude and ChatGPT. ${rec.reason}`,
      };
    }

    return rec;
  });
}

// ─── Main engine ─────────────────────────────────────────────────────────────
export function runAudit(
  tools: ToolEntry[],
  teamSize: number,
  useCase: UseCase
): Omit<AuditResult, "id" | "createdAt" | "aiSummary"> {
  let recommendations: AuditRecommendation[] = tools.map((entry) => {
    switch (entry.toolId) {
      case "cursor":
        return evaluateCursor(entry, teamSize, useCase);
      case "github_copilot":
        return evaluateGithubCopilot(entry, teamSize, useCase);
      case "claude":
        return evaluateClaude(entry, teamSize, useCase);
      case "chatgpt":
        return evaluateChatGPT(entry, teamSize, useCase);
      case "anthropic_api":
      case "openai_api":
        return evaluateAPI(entry);
      case "gemini":
        return evaluateGemini(entry, useCase);
      case "windsurf":
        return evaluateWindsurf(entry, teamSize);
      default:
        return {
          toolId: entry.toolId,
          currentPlan: entry.plan,
          currentSpend: entry.monthlySpend,
          seats: entry.seats,
          recommendedAction: "No changes needed",
          estimatedMonthlyCost: entry.monthlySpend,
          monthlySavings: 0,
          annualSavings: 0,
          reason: "No specific rules for this tool.",
          isOptimal: true,
        };
    }
  });

  recommendations = applyOverlapPenalties(tools, recommendations);

  const totalCurrentSpend = tools.reduce((s, e) => s + e.monthlySpend, 0);
  const totalRecommendedSpend = recommendations.reduce((s, r) => s + r.estimatedMonthlyCost, 0);
  const totalMonthlySavings = recommendations.reduce((s, r) => s + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    recommendations,
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    useCase,
    teamSize,
    isHighSavings: totalMonthlySavings > 500,
  };
}
