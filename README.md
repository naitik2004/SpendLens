# SpendLens — Free AI Spend Audit

SpendLens helps startup founders and engineering managers instantly find out if they're overpaying for AI tools like Cursor, Claude, ChatGPT, and GitHub Copilot — and shows exactly what to switch, downgrade, or cancel to save money.

Built as a lead-generation tool for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

**Live URL:** https://spendlens.vercel.app

---

## Screenshots

> _Add 3+ screenshots here or a Loom/YouTube link to a 30-second demo_
>
> Suggested: (1) landing page, (2) filled form, (3) audit results with savings card

---

## Quick Start

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)
- An Anthropic API key (for AI summaries)
- A Resend account (for transactional email)

### Install & run locally

```bash
git clone https://github.com/yourusername/spendlens
cd spendlens
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
```

Open http://localhost:3000

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Set environment variables in Vercel dashboard
```

### Supabase setup

Run this SQL in your Supabase SQL editor:

```sql
create table audits (
  id text primary key,
  created_at timestamptz default now(),
  audit_data jsonb not null,
  shareable boolean default true
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  audit_id text references audits(id),
  email text not null,
  company_name text,
  role text,
  team_size int,
  ip_hash text
);
```

### Run tests

```bash
npm test
# or with coverage:
npm run test:coverage
```

---

## Decisions

Five trade-offs made during the build:

**1. Hardcoded audit rules vs. AI-powered audit logic**
The audit engine uses deterministic rules, not LLMs. This was an explicit requirement of the brief ("knowing when not to use AI is part of the test"), and it's also the right call — financial reasoning needs to be auditable. If the engine says you're overpaying by $40/month, a user should be able to follow the exact logic to verify it. An LLM that makes up numbers would destroy trust fast.

**2. Supabase over a custom Postgres setup**
Supabase gives a free tier that handles this app's write volume easily, has a great dashboard for manually reviewing leads without building admin UI, and ships with row-level security. The tradeoff is vendor lock-in and slightly more opaque connection handling. For a 7-day build targeting MVP launch, the speed win is worth it.

**3. localStorage for form persistence instead of URL state**
URL state would make partial form-fills shareable, but it also makes the URL ugly and leaks data in referrer headers. localStorage gives reliable persistence across reloads with no UX cost. Downside: doesn't survive a cache clear or different browser — acceptable for a free audit tool.

**4. In-memory rate limiting vs. Redis**
A proper production rate limiter would use Redis so limits are shared across instances. For this MVP, in-memory rate limiting is fine because Vercel's serverless model typically routes the same IP to the same warm function instance for a burst window, and the primary attack vector is form spam, not coordinated DDoS. Adding Redis is a day-1 post-launch task.

**5. Single-file per page over component library**
Kept components flat and co-located rather than building a full component library with design tokens, Storybook, etc. This gets to a working product faster and avoids premature abstraction. The UI is consistent enough without it at this scale.
# SpendLens
