# DEVLOG.md

## Day 1 — 2025-05-19

**Hours worked:** 3

**What I did:** Read the brief in full twice. Mapped every required feature, file, and evaluation criterion to a checklist. Set up the Next.js project with TypeScript and Tailwind. Initialized the GitHub repo. Made first architectural decision: API routes inside Next.js (no separate Express server) for zero deployment overhead. Started sketching the data model — what an `AuditResult` looks like, what a `ToolEntry` looks like.

**What I learned:** The brief explicitly says "knowing when not to use AI is part of the test" for the audit engine. That means the pricing logic needs to be hardcoded rules, not LLM calls. This is actually the right product decision too — a finance person needs to be able to read the reasoning and agree with it. LLMs hallucinate numbers.

**Blockers / what I'm stuck on:** Not blocked, but pricing data research is going to take longer than I expected. Each tool has multiple plans with edge cases (e.g., Cursor Hobby is technically free but limited; GitHub Copilot is free for students).

**Plan for tomorrow:** Define all TypeScript types, write the full pricing data module with sourced numbers, start the audit engine rules.

---

## Day 2 — 2025-05-20

**Hours worked:** 5

**What I did:** Wrote `src/types/index.ts` — all interfaces for the full data flow. Wrote `src/lib/pricing-data.ts` — every tool, every plan, with official prices. Verified each price against the vendor's pricing page and noted the source. Started the audit engine. Got Cursor, GitHub Copilot, and Claude rules working. The overlap detection logic (running multiple code assistants simultaneously) was a key insight — a lot of teams do this and don't notice.

**What I learned:** GitHub Copilot is free for verified students and OSS maintainers — this is worth surfacing in the audit. Claude Team is $30/seat but individual Pro is $20/seat, so a 2-person team on Team is paying 50% more than they need to. These kinds of specific insights are what makes the audit feel smart.

**Blockers / what I'm stuck on:** Windsurf pricing page is slightly confusing — they have "Codeium" branding on some plans and "Windsurf" on others. Took 15 minutes to confirm the Pro plan is $15/seat.

**Plan for tomorrow:** Finish audit engine for all 8 tools. Write the Anthropic API summary generator with fallback. Set up Supabase tables.

---

## Day 3 — 2025-05-21

**Hours worked:** 6

**What I did:** Finished all audit engine rules and the overlap penalty logic. Wrote the Anthropic API integration for AI summaries, including the fallback that generates a templated paragraph from audit data — this was important because the brief requires handling API failures gracefully. Set up Supabase project, created the `audits` and `leads` tables. Wrote `POST /api/audit` and tested it with curl against a local dev server.

**What I learned:** The AI summary prompt took several iterations. First version was too long (the model would go over 100 words). Adding "exactly one paragraph, 90-110 words" to the system prompt fixed this. Also learned that starting the prompt with "Based on your audit..." produces boilerplate-sounding text — the system prompt now says "Do not start with 'Based on'" explicitly.

**Blockers / what I'm stuck on:** Resend account requires domain verification before sending to arbitrary emails — only the sandbox allows sending to your own email. Will note this in setup docs. Not a blocker for the audit functionality.

**Plan for tomorrow:** Build the spend input form UI, lead capture form, and wire up the full API call chain from form to results page.

---

## Day 4 — 2025-05-22

**Hours worked:** 7

**What I did:** Built `SpendForm.tsx` with localStorage persistence — tested this specifically by filling in a form, closing the tab, reopening, and confirming state was restored. Built `AuditResults.tsx` with the hero savings card, per-tool breakdown, and Credex CTA for high-savings cases. Built `LeadCapture.tsx` with honeypot field for basic bot protection. Wired up the home page (`page.tsx`) with the full form → API → results flow. Also built the `POST /api/leads` route with rate limiting and the Resend email integration.

**What I learned:** The visual design of the results page is important — the brief says "this is the page that gets screenshotted and shared." Spent more time than planned on the hero savings card to make it feel substantial. The color choice (teal gradient for high-savings, neutral dark for optimal) communicates the message before a user reads a word.

**Blockers / what I'm stuck on:** OG image for the share page is a static PNG for now — a dynamic image (e.g., via `@vercel/og`) would be better but is a bonus feature. Will attempt on Day 6 if time allows.

**Plan for tomorrow:** Build the share page with dynamic OG tags. Write all 6 required markdown files. Start the tests.

---

## Day 5 — 2025-05-23

**Hours worked:** 5

**What I did:** Built the share page (`/share/[id]`) as a server component with `generateMetadata()` for dynamic OG/Twitter card tags based on the audit's savings numbers. Wrote the GET `/api/share/[id]` route that strips PII before returning data. Wrote the full test suite in `src/__tests__/audit-engine.test.ts` — 6 test groups covering plan evaluation, savings math, overlap detection, and threshold logic. Set up Jest config. Wrote `PRICING_DATA.md` with all sourced URLs.

**What I learned:** Next.js App Router's `generateMetadata` function makes per-page OG tags easy — you just return a `Metadata` object and Next handles the rest. The dynamic title (`"$X/mo in savings found"`) makes link previews much more compelling than a generic title.

**Blockers / what I'm stuck on:** TypeScript strict mode flagged a few places where I assumed `find()` returned non-null. Added null assertions with comments explaining why they're safe at each call site.

**Plan for tomorrow:** Set up GitHub Actions CI. Write GTM.md, ECONOMICS.md, METRICS.md. Attempt user interviews.

---

## Day 6 — 2025-05-24

**Hours worked:** 6

**What I did:** Set up GitHub Actions CI (lint + test + build check on every push to main). Wrote GTM.md with specific channels and first-100-users plan. Wrote ECONOMICS.md with unit economics model. Wrote USER_INTERVIEWS.md after conducting 3 real conversations — two with indie founders I found through a Discord server, one with a friend running a small agency. Wrote LANDING_COPY.md and METRICS.md. Deployed to Vercel and confirmed the live URL works end-to-end.

**What I learned:** The user interviews changed how I think about the product. One founder said "I don't actually know what I'm paying for AI — it comes out of my card automatically." That's the real insight — it's not that people are cheap, it's that the spend is invisible until it's painful. The audit's job is to make it visible, not to lecture.

**Blockers / what I'm stuck on:** One of my tests was failing due to how I'd written the `isHighSavings` test — it was checking for a specific dollar amount that depends on internal rule logic I'd changed. Fixed by making the test check the boolean against the computed savings amount rather than hardcoding the expected value.

**Plan for tomorrow:** Final pass on all files. Verify all 6 MVP features work end-to-end on the live URL. Write REFLECTION.md and TESTS.md. Submit.

---

## Day 7 — 2025-05-25

**Hours worked:** 4

**What I did:** Full end-to-end smoke test on the live Vercel URL. Fixed a minor bug: when `monthlySpend` was entered as `0` for a free-tier tool, the form was showing NaN in the savings display (fixed with `|| 0` coercion). Verified share URLs work and OG tags render correctly (used Twitter Card Validator). Wrote REFLECTION.md. Did a final review of all markdown files for completeness. Ran `git log --pretty=format:"%ad" --date=short | sort -u | wc -l` to confirm commits on 7 distinct days. All good.

**What I learned:** The biggest thing from this week: scoping an MVP is a skill. The brief has a lot of features, and the temptation is to start every feature and finish none of them. Prioritizing a working, polished end-to-end flow over bonus features (PDF export, embeddable widget) was the right call. A half-built PDF export helps no one.

**Blockers / what I'm stuck on:** None on final day. The only thing I would have done differently is start the user interviews on Day 2 rather than Day 6 — they would have influenced the audit engine design if done earlier.
