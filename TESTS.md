# TESTS.md

All tests are located in `src/__tests__/`. Run them with:

```bash
npm test
# or with coverage report:
npm run test:coverage
```

The CI pipeline (`/.github/workflows/ci.yml`) runs `npm test` automatically on every push to `main`.

---

## Test Files

### `src/__tests__/audit-engine.test.ts`

The core test file — all tests cover the audit engine specifically as required.

| Test | What it covers | Group |
|------|---------------|-------|
| `recommends downgrade from Business to Pro for 2-person team` | Cursor Business plan flagged as overkill for ≤2 seats; verifies exact monthly ($40) and annual ($480) savings calculation | Cursor plan evaluation |
| `marks cursor pro as optimal for coding use case` | Cursor Pro for a solo coding workflow should not show significant savings | Cursor plan evaluation |
| `flags cursor for non-coding use case` | Cursor recommended for cancellation when primary use case is writing — saves full $20/seat | Cursor plan evaluation |
| `recommends switching Claude Team to individual Pro for 2-person team` | Claude Team ($30/seat) vs individual Pro ($20/seat) flagged for teams of 2 | Claude plan evaluation |
| `flags Claude Max for single user as potentially excessive` | Claude Max ($100) vs Pro ($20) — $80/month saving flagged unless usage justifies Max tier | Claude plan evaluation |
| `correctly sums monthly and annual savings across tools` | Multi-tool audit: Cursor Business + Claude Team, verifies total current spend ($140) and total savings ($60/mo, $720/yr) | Total savings calculation |
| `returns zero savings for already-optimal stack` | Single Cursor Pro seat — confirms non-negative savings and annual = 12x monthly | Total savings calculation |
| `marks audit as high savings when monthly savings exceed $500` | `isHighSavings` flag is true when `totalMonthlySavings > 500` | High savings threshold |
| `isHighSavings is false when savings are under $500` | `isHighSavings` flag is false for small/optimal stacks | High savings threshold |
| `flags high Anthropic API spend with subscription alternative note` | $350/mo API spend flagged with subscription alternative note | API tool evaluation |
| `marks low API spend as optimal` | $50/mo OpenAI API is marked optimal, zero savings | API tool evaluation |
| `annual savings is always exactly 12x monthly savings` | Invariant test: `annualSavings === monthlySavings * 12` for every recommendation | Math consistency |
| `total current spend matches sum of individual tool spends` | `totalCurrentSpend` equals the sum of `monthlySpend` inputs | Math consistency |

---

## How to Run

```bash
# All tests
npm test

# Watch mode (re-runs on file changes)
npm test -- --watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- audit-engine
```

Expected output on a passing run:
```
PASS src/__tests__/audit-engine.test.ts
  Cursor plan evaluation
    ✓ recommends downgrade from Business to Pro for 2-person team
    ✓ marks cursor pro as optimal for coding use case
    ✓ flags cursor for non-coding use case
  Claude plan evaluation
    ✓ recommends switching Claude Team to individual Pro for 2-person team
    ✓ flags Claude Max for single user as potentially excessive
  Total savings calculation
    ✓ correctly sums monthly and annual savings across tools
    ✓ returns zero savings for already-optimal stack
  High savings threshold
    ✓ marks audit as high savings when monthly savings exceed $500
    ✓ isHighSavings is false when savings are under $500
  API tool evaluation
    ✓ flags high Anthropic API spend with subscription alternative note
    ✓ marks low API spend as optimal
  Math consistency
    ✓ annual savings is always exactly 12x monthly savings
    ✓ total current spend matches sum of individual tool spends

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```
