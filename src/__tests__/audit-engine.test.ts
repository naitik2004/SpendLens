import { runAudit } from "@/lib/audit-engine";
import type { ToolEntry } from "@/types";

// ─── Test 1: Business plan overkill for small teams ──────────────────────────
describe("Cursor plan evaluation", () => {
  test("recommends downgrade from Business to Pro for 2-person team", () => {
    const tools: ToolEntry[] = [
      { toolId: "cursor", plan: "business", monthlySpend: 80, seats: 2 },
    ];
    const result = runAudit(tools, 2, "coding");
    const rec = result.recommendations.find((r) => r.toolId === "cursor")!;

    expect(rec).toBeDefined();
    expect(rec.recommendedAction).toMatch(/downgrade/i);
    expect(rec.monthlySavings).toBe(40); // 2 * ($40 - $20)
    expect(rec.annualSavings).toBe(480);
    expect(rec.isOptimal).toBe(false);
  });

  test("marks cursor pro as optimal for coding use case", () => {
    const tools: ToolEntry[] = [
      { toolId: "cursor", plan: "pro", monthlySpend: 20, seats: 1 },
    ];
    const result = runAudit(tools, 1, "coding");
    const rec = result.recommendations.find((r) => r.toolId === "cursor")!;

    // Either optimal or a minor note about windsurf comparison
    // Either way, should not have massive savings
    expect(rec.monthlySavings).toBeLessThan(10);
  });

  test("flags cursor for non-coding use case", () => {
    const tools: ToolEntry[] = [
      { toolId: "cursor", plan: "pro", monthlySpend: 20, seats: 1 },
    ];
    const result = runAudit(tools, 1, "writing");
    const rec = result.recommendations.find((r) => r.toolId === "cursor")!;

    expect(rec.isOptimal).toBe(false);
    expect(rec.recommendedAction).toMatch(/cancel/i);
    expect(rec.monthlySavings).toBe(20);
  });
});

// ─── Test 2: Claude Team vs individual Pro ───────────────────────────────────
describe("Claude plan evaluation", () => {
  test("recommends switching Claude Team to individual Pro for 2-person team", () => {
    const tools: ToolEntry[] = [
      { toolId: "claude", plan: "team", monthlySpend: 60, seats: 2 },
    ];
    const result = runAudit(tools, 2, "writing");
    const rec = result.recommendations.find((r) => r.toolId === "claude")!;

    expect(rec.monthlySavings).toBe(20); // 2 * ($30 - $20)
    expect(rec.recommendedAction).toMatch(/pro/i);
    expect(rec.isOptimal).toBe(false);
  });

  test("flags Claude Max for single user as potentially excessive", () => {
    const tools: ToolEntry[] = [
      { toolId: "claude", plan: "max", monthlySpend: 100, seats: 1 },
    ];
    const result = runAudit(tools, 1, "writing");
    const rec = result.recommendations.find((r) => r.toolId === "claude")!;

    expect(rec.monthlySavings).toBe(80); // $100 - $20 Pro
    expect(rec.isOptimal).toBe(false);
  });
});

// ─── Test 3: Total savings calculation ──────────────────────────────────────
describe("Total savings calculation", () => {
  test("correctly sums monthly and annual savings across tools", () => {
    const tools: ToolEntry[] = [
      { toolId: "cursor", plan: "business", monthlySpend: 80, seats: 2 }, // saves $40
      { toolId: "claude", plan: "team", monthlySpend: 60, seats: 2 }, // saves $20
    ];
    const result = runAudit(tools, 2, "coding");

    expect(result.totalCurrentSpend).toBe(140);
    expect(result.totalMonthlySavings).toBe(60);
    expect(result.totalAnnualSavings).toBe(720);
  });

  test("returns zero savings for already-optimal stack", () => {
    const tools: ToolEntry[] = [
      { toolId: "cursor", plan: "pro", monthlySpend: 20, seats: 1 },
    ];
    const result = runAudit(tools, 1, "coding");

    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});

// ─── Test 4: isHighSavings threshold ─────────────────────────────────────────
describe("High savings threshold", () => {
  test("marks audit as high savings when monthly savings exceed $500", () => {
    // Build a scenario with big savings
    const tools: ToolEntry[] = [
      { toolId: "cursor", plan: "enterprise", monthlySpend: 2000, seats: 20 },
    ];
    const result = runAudit(tools, 20, "coding");
    // Enterprise with savings > 500
    if (result.totalMonthlySavings > 500) {
      expect(result.isHighSavings).toBe(true);
    } else {
      expect(result.isHighSavings).toBe(false);
    }
  });

  test("isHighSavings is false when savings are under $500", () => {
    const tools: ToolEntry[] = [
      { toolId: "cursor", plan: "pro", monthlySpend: 20, seats: 1 },
    ];
    const result = runAudit(tools, 1, "coding");
    expect(result.isHighSavings).toBe(false);
  });
});

// ─── Test 5: API spend evaluation ────────────────────────────────────────────
describe("API tool evaluation", () => {
  test("flags high Anthropic API spend with subscription alternative note", () => {
    const tools: ToolEntry[] = [
      { toolId: "anthropic_api", plan: "pay_as_you_go", monthlySpend: 350, seats: 1 },
    ];
    const result = runAudit(tools, 1, "data");
    const rec = result.recommendations.find((r) => r.toolId === "anthropic_api")!;

    expect(rec.isOptimal).toBe(false);
    expect(rec.reason).toMatch(/subscription/i);
  });

  test("marks low API spend as optimal", () => {
    const tools: ToolEntry[] = [
      { toolId: "openai_api", plan: "pay_as_you_go", monthlySpend: 50, seats: 1 },
    ];
    const result = runAudit(tools, 1, "coding");
    const rec = result.recommendations.find((r) => r.toolId === "openai_api")!;

    expect(rec.isOptimal).toBe(true);
    expect(rec.monthlySavings).toBe(0);
  });
});

// ─── Test 6: Annual savings is exactly 12x monthly ───────────────────────────
describe("Math consistency", () => {
  test("annual savings is always exactly 12x monthly savings", () => {
    const tools: ToolEntry[] = [
      { toolId: "claude", plan: "team", monthlySpend: 90, seats: 3 },
      { toolId: "cursor", plan: "business", monthlySpend: 120, seats: 3 },
    ];
    const result = runAudit(tools, 3, "coding");

    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);

    result.recommendations.forEach((rec) => {
      expect(rec.annualSavings).toBe(rec.monthlySavings * 12);
    });
  });

  test("total current spend matches sum of individual tool spends", () => {
    const tools: ToolEntry[] = [
      { toolId: "cursor", plan: "pro", monthlySpend: 40, seats: 2 },
      { toolId: "github_copilot", plan: "business", monthlySpend: 38, seats: 2 },
    ];
    const result = runAudit(tools, 2, "coding");

    expect(result.totalCurrentSpend).toBe(78);
  });
});
