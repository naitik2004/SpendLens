# METRICS.md

## North Star metric

**Qualified audits completed per week**

A "qualified audit" = at least 2 tools entered, form submitted, result rendered. This is the metric because:
- It measures genuine value delivered (not just page views)
- It's the top of the conversion funnel — everything downstream (email captures, consultations, credit purchases) is a function of this
- DAU/MAU is wrong for this tool — most users audit once per quarter, not daily. Optimising for DAU would lead to bad product decisions

---

## 3 input metrics that drive the North Star

**1. Landing page → form start rate**
*Target: >40%*
If visitors read the hero and don't start the form, the copy or the credibility isn't working. This is the first filter. Below 25% = rewrite the hero.

**2. Form start → audit completed rate**
*Target: >60%*
If people start the form and abandon, the form is too complex or confusing. Each tool entry row is a potential drop-off point. Below 40% = simplify the form, reduce required fields.

**3. Audit completed → email captured rate**
*Target: >30%*
The value must be shown before the email ask (which it is — email is always post-results). Below 20% = the results aren't compelling enough or the email prompt is too aggressive.

---

## What to instrument first

In priority order:

1. **Funnel events:** `page_view`, `form_started`, `tool_added`, `audit_submitted`, `audit_viewed`, `email_submitted`
2. **Per-tool engagement:** which tools appear in audits most (tells us where the market is)
3. **Savings distribution:** histogram of `totalMonthlySavings` across all audits (tells us if the tool is finding real waste or mostly zero)
4. **Share link clicks:** how many share URLs get clicked (measures viral coefficient)
5. **Time to complete:** median seconds from form_started to audit_submitted (proxy for form friction)

Use PostHog (free tier) — it captures all of these with 3 lines of code and the session replay helps debug form abandonment.

---

## Pivot trigger number

**If audit completed → email captured rate falls below 15% for 2 consecutive weeks**, investigate. Either:
- The savings numbers are too low to motivate email capture (tool isn't finding real waste → improve audit rules or pricing data)
- The email prompt placement or copy is wrong (test moving it, rewording it)
- The wrong audience is arriving (check acquisition sources — HN traffic converts differently than Twitter traffic)

**If qualified audits per week is below 20 after 4 weeks of active distribution**, the distribution strategy isn't working. Move to a different channel or reconsider the landing page entirely.
