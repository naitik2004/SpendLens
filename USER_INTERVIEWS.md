# USER_INTERVIEWS.md

Three real conversations conducted during the build week. Each was 10–15 minutes via DM or voice note exchange.

---

## Interview 1 — R.K., CTO, 12-person Series A SaaS (India)

**Context:** Found via a mutual connection. Runs a team of 7 engineers.

**Direct quotes:**
- "I honestly don't know what we pay for AI tools. It's on the company card and I approved it once."
- "We have Cursor for the devs and I think someone added ChatGPT Team but I'm not sure if everyone uses it."
- "I would use something like this before our next board meeting — we're trying to cut burn."

**Most surprising thing:** He had no idea his team was running both Cursor Pro and GitHub Copilot simultaneously. "I thought Cursor replaced Copilot. Some people must have kept both."

**What it changed:** I added the overlap detection logic as a first-class feature. The biggest savings for many teams isn't plan optimization — it's eliminating duplicate tools they didn't realize they were paying for twice.

---

## Interview 2 — M.T., Indie founder, solo (US, bootstrapped)

**Context:** Found via Indie Hackers Discord. Running a SaaS with $4k MRR, solo.

**Direct quotes:**
- "I pay for Claude Pro and ChatGPT Plus. $40/month. I use Claude 90% of the time."
- "I know I should cancel one but I always think 'what if I need it' and then I don't cancel."
- "The annual savings number is what would get me. $240/year sounds real. $20/month doesn't."

**Most surprising thing:** The friction to cancel isn't price — it's fear of missing out on a specific capability. He kept ChatGPT because of DALL-E, which he uses maybe twice a month.

**What it changed:** The per-tool reason text now explicitly calls out which specific features justify a plan. If the user only needs DALL-E occasionally, there are alternatives. Made the reasoning more capability-specific, not just price-based.

---

## Interview 3 — P.S., Engineering Manager, 40-person startup (India)

**Context:** College network connection. Manages a team of 15 engineers.

**Direct quotes:**
- "We moved everyone to Cursor Business because someone said it was better for teams. I don't know what 'better' means exactly."
- "Our AI spend went from maybe $200/month to $600/month in six months and I only noticed because finance flagged it."
- "I'd share a tool like this with my team lead and say 'run this and tell me what you find.' I wouldn't fill it in myself."

**Most surprising thing:** The decision to upgrade to Business was made by a team lead, not by him, without a clear feature justification. The spending scaled because individual contributors had card access.

**What it changed:** Added team-size context more prominently in the form — the audit now explicitly flags when a Business or Enterprise plan's features (SSO, admin controls, policy enforcement) only make sense above a certain team size. The reasoning text got more specific about *which* Business features matter and *when*.
