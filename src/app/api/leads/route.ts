import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, hashIp } from "@/lib/utils";

const LeadSchema = z.object({
  auditId: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ?? "unknown";

  if (!checkRateLimit(ip, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = LeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (parsed.data.website) {
      return NextResponse.json({ ok: true }); // honeypot triggered
    }

    const { auditId, email, companyName, role, teamSize } = parsed.data;

    // Fetch audit for email content
    const { data: auditRow } = await supabase
      .from("audits").select("audit_data").eq("id", auditId).single();

    // Store lead
    const { error: dbError } = await supabase.from("leads").insert({
      audit_id: auditId, email,
      company_name: companyName,
      role, team_size: teamSize,
      ip_hash: hashIp(ip),
    });
    if (dbError) console.error("Lead storage error:", dbError);

    // Send email via Resend
    const audit = auditRow?.audit_data as {
      totalMonthlySavings?: number;
      totalAnnualSavings?: number;
      isHighSavings?: boolean;
    } | null;

    const savings = audit?.totalMonthlySavings ?? 0;
    const annualSavings = audit?.totalAnnualSavings ?? 0;
    const isHighSavings = audit?.isHighSavings ?? false;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens.app";

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "audit@spendlens.app",
        to: email,
        subject: savings > 0
          ? `Your SpendLens audit — ${fmt(savings)}/mo in savings found`
          : "Your SpendLens audit is ready",
        html: buildEmail({ email, auditId, savings, annualSavings, isHighSavings, appUrl }),
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Leads API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function buildEmail({ email, auditId, savings, annualSavings, isHighSavings, appUrl }: {
  email: string; auditId: string; savings: number;
  annualSavings: number; isHighSavings: boolean; appUrl: string;
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;max-width:580px;margin:0 auto;padding:32px;background:#f9f8f6;color:#1a1714;">
<div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e8e6e0;">
  <p style="font-size:18px;font-weight:700;color:#1a1714;margin:0 0 4px;letter-spacing:-0.02em;">SpendLens</p>
  <p style="color:#a09890;font-size:13px;margin:0 0 28px;">by Credex</p>
  ${savings > 0
    ? `<div style="background:#e8f5ee;border:1px solid #b7ddc8;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="font-size:13px;color:#1a6b4a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Potential monthly savings</p>
        <p style="font-size:36px;font-weight:700;color:#1a6b4a;margin:0 0 4px;letter-spacing:-0.03em;">${fmt(savings)}</p>
        <p style="color:#2d8a62;margin:0;font-size:14px;">${fmt(annualSavings)}/year</p>
      </div>`
    : `<div style="background:#e8f5ee;border:1px solid #b7ddc8;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="font-weight:600;color:#1a6b4a;margin:0;">You're spending well on AI tools.</p>
        <p style="color:#2d8a62;margin:4px 0 0;font-size:14px;">No major optimisations found right now.</p>
      </div>`}
  <a href="${appUrl}/share/${auditId}" style="display:inline-block;background:#1a6b4a;color:white;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:24px;">View your full audit →</a>
  ${isHighSavings
    ? `<div style="border-top:1px solid #e8e6e0;padding-top:20px;margin-top:4px;">
        <p style="font-weight:600;margin:0 0 6px;font-size:14px;">Want to lock in even more savings?</p>
        <p style="color:#736b63;margin:0 0 14px;font-size:13px;">Credex sources discounted AI credits — Cursor, Claude, ChatGPT Enterprise — from companies that overforecast. A team member may reach out shortly.</p>
        <a href="https://credex.rocks" style="color:#1a6b4a;text-decoration:none;font-weight:600;font-size:13px;">Learn about Credex →</a>
      </div>` : ""}
  <p style="color:#d4d0c8;font-size:11px;margin:24px 0 0;border-top:1px solid #f5f4f0;padding-top:16px;">SpendLens by Credex · <a href="https://credex.rocks" style="color:#d4d0c8;">credex.rocks</a></p>
</div></body></html>`;
}
