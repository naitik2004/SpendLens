import type { AuditResult } from "@/types";

const SYSTEM_PROMPT = `You are a concise, direct AI spend analyst.
Given an audit result, write exactly one paragraph (90-110 words) summarizing:
1. The user's biggest waste or win
2. The single most impactful action they should take
3. A realistic expectation for their savings

Tone: like a trusted CFO friend giving honest, specific advice — not marketing copy.
Do not use bullet points. Do not use headers. Output plain prose only.
Do not start with "Based on" or "Looking at your" — start with a direct observation.`;

function buildUserPrompt(audit: Omit<AuditResult, "aiSummary">): string {
  const lines = audit.recommendations.map(
    (r) =>
      `- ${r.toolId} (${r.currentPlan}, ${r.seats} seat(s), $${r.currentSpend}/mo): ${r.recommendedAction} → saves $${r.monthlySavings}/mo. ${r.reason}`
  );
  return `Team size: ${audit.teamSize}
Primary use case: ${audit.useCase}
Current total AI spend: $${audit.totalCurrentSpend}/month
Potential monthly savings: $${audit.totalMonthlySavings}/month ($${audit.totalAnnualSavings}/year)

Tool-by-tool breakdown:
${lines.join("\n")}

Write the 90-110 word summary paragraph now.`;
}

export async function generateAISummary(
  audit: Omit<AuditResult, "aiSummary">
): Promise<string> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 200,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(audit) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");
    return text.trim();
  } catch (error) {
    console.error("AI summary failed, using fallback:", error);
    return generateFallbackSummary(audit);
  }
}

function generateFallbackSummary(audit: Omit<AuditResult, "aiSummary">): string {
  const { totalMonthlySavings, totalAnnualSavings, totalCurrentSpend, useCase, teamSize } = audit;

  if (totalMonthlySavings === 0) {
    return `Your team of ${teamSize} is spending $${totalCurrentSpend}/month on AI tools and doing so efficiently. Your current stack aligns well with your ${useCase} use case, and there are no obvious plan mismatches or redundancies. This is what good AI spend hygiene looks like — bookmark this audit and revisit it quarterly as your team grows and new tools launch.`;
  }

  const topRec = audit.recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  return `Your team of ${teamSize} is spending $${totalCurrentSpend}/month on AI tools and leaving $${totalMonthlySavings}/month — $${totalAnnualSavings}/year — on the table. The biggest lever is ${topRec ? `your ${topRec.toolId} setup` : "plan consolidation"}: ${topRec?.reason ?? "review overlapping subscriptions"}. Making these changes before your next billing cycle takes under an hour and captures most of the savings immediately.`;
}
