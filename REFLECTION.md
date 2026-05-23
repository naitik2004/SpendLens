# REFLECTION.md

## 1. The hardest bug you hit this week, and how you debugged it

Okay so this one genuinely wasted like two hours of my Friday and I still feel a bit stupid about it.

The audit results were showing up fine savings numbers, recommendations, everything. But the AI summary was always the fallback template, never the actual Groq-generated one. No error in the console, no 500 from the API. Just silently falling back every single time.

My first thought was the API key. Checked `.env.local` — key was there. Copied it manually into a curl request and it worked fine. So the key was good.

Then I thought maybe the fetch was timing out. Added a console.log right before and after the fetch call. The log before printed. The log after never did. So it was hanging somewhere in the fetch.

Spent probably 45 minutes going in circles before I actually read the error properly. I'd been looking at the browser console  but this is a server-side API route. The error was in the **terminal where `npm run dev` was running**, not in the browser. When I finally looked there it just said `TypeError: fetch is not a function`.

Node 18 has native fetch but I was running Node 16 locally (my default). The Groq SDK uses native fetch internally and it just... didn't exist. Fixed it by either upgrading Node or importing node-fetch  I went with upgrading because I should've been on 18 anyway.

What I should have done immediately: check the terminal output, not the browser console. Server errors don't show up in the browser. I knew this. I just forgot in the moment because I was moving fast. Lesson re-learned the hard way.

---

## 2. A decision you reversed mid-week, and what made you reverse it

I started building the results page as a separate route like `/audit/[id]` — so after submitting the form you'd get redirected to a URL with the audit ID in it. The idea was that the result page would be its own thing, shareable by default, with OG tags, the whole deal.

Got about halfway through it on day 2 and then just... stopped. It felt wrong.

The problem was I'd painted myself into a corner with the data flow. To make `/audit/[id]` work as a server component with proper OG tags, the full audit result needs to be in the database before the redirect happens. Which means the API call, the Groq summary, and the database write all have to complete before the user sees anything. On a slow connection or if Groq takes 3-4 seconds (which it sometimes does), that's a genuinely bad experience user clicks submit and just stares at a loading screen with no feedback.

The other option was storing everything in the URL as a query param, which felt hacky and would've made the URLs hideous.

I ended up keeping everything on the home page — form and results in the same component, just switching state. The share URL (`/share/[id]`) is a separate deliberate action the user takes after they've seen their results. This way the audit displays instantly from the API response, and the Supabase write can happen in the background. If it fails, the user still has their results.

Took me about 20 minutes to delete the half-built route and rewrite the home page logic. Honestly should've thought through the data flow before starting, but I didn't. Now the home page approach feels obviously right.

---

## 3. What you would build in week 2

Three things, and I'm being honest about priority instead of listing everything that sounds good:

**First — benchmark mode.** This is the feature that makes the results feel like *data* instead of *advice*. Right now the audit tells you what you're spending and what you could save. But there's no context — is $200/month per developer a lot? A little? Normal? If I could show "teams your size and use case average $X per developer on AI tools — you're at $Y," that's a number someone will screenshot and share. Building it requires aggregating the audit data we already collect, which I'd do with a simple Supabase view and a cron job. No new infrastructure.

**Second — fix the email deliverability properly.** Right now Resend is set up but I haven't verified a domain, which means emails either land in spam or don't send at all in production. This is blocking the lead capture from actually working. One afternoon of DNS config and it's done. Should've done it during the week but kept deprioritising it.

**Third — the shareable OG image.** The `/share/[id]` page has dynamic OG meta tags but the image is a static PNG. A dynamic image that shows the actual savings number in big text (via `@vercel/og`) would make the Twitter card look like this:

```
[SpendLens]
Found $640/month in AI savings
See your own audit →
```

That's the kind of thing that gets retweeted. Right now it's just the logo. It's maybe 2 hours of work and I'd prioritise it above almost everything else for virality.

---

## 4. How you used AI tools

Honestly, a lot. I used Claude throughout the week, mostly Sonnet. I want to be specific about where because the brief asks for it and I think the distinction matters.

**Things I used it for:**

Writing the HTML email template. Email HTML is awful — tables inside tables, inline styles everywhere, Outlook quirks. I described what I wanted and let it generate the structure, then edited the copy and colours myself. Saved probably an hour.

Talking through the audit engine logic before writing it. I'd describe a scenario ("user is on Cursor Business with 2 seats, what should we flag") and use the conversation to pressure-test my reasoning before writing any code. This is the most useful thing — it's faster than rubber duck debugging and the responses actually push back sometimes.

Generating the first draft of the Supabase SQL schema. I knew what tables I needed, just didn't want to look up the exact Postgres syntax for `gen_random_uuid()` and `timestamptz`. Took 30 seconds.

**Things I explicitly didn't use it for:**

The audit engine rules themselves. Every single recommendation — why Cursor Business is overkill for 2 people, why Claude Team costs more than individual Pro for small teams, when API direct billing makes sense — I wrote from reading the actual vendor pricing pages. If I'd let an AI write those rules it would have been confidently wrong about specific numbers and I wouldn't have caught it until someone flagged it.

The pricing data. I manually opened every pricing page, read it, and typed the numbers in. The model's training data for current SaaS pricing is unreliable.

**One time the AI was wrong and I caught it:**

I asked Claude to help me write the rate limiting logic and it suggested using `Date.now()` inside the Map value comparison but storing the reset time as `Date.now() + windowMs` at creation. The logic was subtly backwards — it was checking if now was *greater than* the reset time to allow requests, but it had the reset time set in the future, so it was blocking everything on the first request.

I caught it because I tested it manually with two quick form submissions and both got rate limited immediately. Traced it back, saw the logic, fixed it. The model had the right *idea* but the comparison direction was wrong. This is exactly the kind of thing that would've passed a casual review.

---

## 5. Self-ratings

**Discipline: 6/10**

I started on day 1 and committed every day, which I'm proud of. But I'll be honest — day 5 and day 6 were shorter than I'd planned because I had other things going on that week. The user interviews happened on day 6 when they should've happened on day 2. If I'd done them earlier they would've actually changed what I built instead of just confirming decisions I'd already made. That's on me.

**Code quality: 7/10**

The types are solid and the audit engine is readable — I put real thought into making the rule logic follow-able for someone who doesn't know the codebase. The components are too long though. `AuditResults.tsx` in particular has too much going on and should be broken up. I kept telling myself I'd refactor it and didn't. The inline styles work but in a team setting I'd want a proper design token system.

**Design sense: 6/10**

The UI is clean and it works. The light theme with the green accent reads well and the savings hero card communicates the point before you read a word. But I played it safe — nothing about the visual design is surprising or memorable. A good designer would've found something more distinctive within the same constraints. I prioritised "not broken" over "beautiful."

**Problem-solving: 8/10**

The decision to keep form and results on the same page instead of splitting into separate routes was the right call and I made it early enough to actually matter. The overlap detection logic in the audit engine (flagging when someone runs Cursor + Copilot simultaneously) came from the user interviews and I think it's the most genuinely useful insight in the whole thing. I'm happy with how I approached the fallback for the AI summary — no errors surface to the user no matter what happens on the Groq side.

**Entrepreneurial thinking: 7/10**

The GTM and economics sections reflect real thinking. The user interviews changed how I understand the core problem — it's not that people are spending too much, it's that the spend is invisible until it becomes painful. I tried to build the product around that insight. The weakness is I haven't actually validated whether the tool drives Credex consultations, which is the whole point. That's week 2's job.