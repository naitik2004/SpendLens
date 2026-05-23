# PROMPTS.md

## AI Summary Prompt

The AI summary is generated using Groq's API (`llama-3.3-70b-versatile` model). This is the only place AI is used in the product — the audit engine itself is deterministic hardcoded rules.

---

### System Prompt

```
You are a concise, direct AI spend analyst.
Given an audit result, write exactly one paragraph (90-110 words) summarizing:
1. The user's biggest waste or win
2. The single most impactful action they should take
3. A realistic expectation for their savings

Tone: like a trusted CFO friend giving honest, specific advice — not marketing copy.
Do not use bullet points. Do not use headers. Output plain prose only.
Do not start with "Based on" or "Looking at your" — start with a direct observation.
```

### User Prompt (dynamically constructed)

```
Team size: {teamSize}
Primary use case: {useCase}
Current total AI spend: ${totalCurrentSpend}/month
Potential monthly savings: ${totalMonthlySavings}/month (${totalAnnualSavings}/year)

Tool-by-tool breakdown:
- {toolId} ({plan}, {seats} seat(s), ${currentSpend}/mo): {recommendedAction} → saves ${monthlySavings}/mo. {reason}
[...repeated for each tool]

Write the 90-110 word summary paragraph now.
```

---

## Why this prompt structure

**System prompt rationale:**
- "like a trusted CFO friend" — anchors the tone. Without this, LLMs default to generic AI-assistant voice ("Based on your audit results, I can see that...")
- "Do not start with 'Based on'" — explicit prohibition because it's the most common failure mode
- "90-110 words" — tight word count forces the model to prioritise. Without it, the model writes 200+ words and buries the key insight

**User prompt rationale:**
- Structured data (not prose) in the user prompt gives the model clean numbers to reason from
- Including the `reason` field from each recommendation gives the model the defensible logic so it doesn't invent its own
- "Write the summary paragraph now." at the end — removes preamble like "Sure, here's a summary:"

---

## What I tried that didn't work

**Attempt 1 — Single combined prompt, no system/user split:**
The model would acknowledge the instructions then ignore them, writing 3-4 sentences that started with "Based on your spending data..."

**Attempt 2 — Asking for bullet points first, then a summary:**
Produced verbose output. The bullets took up tokens and the summary was thin.

**Attempt 3 — Temperature 0.7:**
Output varied too much in quality. At 0.7, some outputs were great, some were vague. Lowering to 0.4 made outputs consistently specific.

**Attempt 4 — Including full pricing context in the prompt:**
Made the prompt too long and the model would get distracted summarising pricing rather than diagnosing the specific user's situation.

---

## Fallback

If the Groq API fails (timeout, rate limit, outage), `generateFallbackSummary()` runs instead. It produces a deterministic paragraph using template strings filled with the audit data. Users never see an error — they get a slightly less fluent but fully accurate summary. The fallback is in `src/lib/ai-summary.ts`.
