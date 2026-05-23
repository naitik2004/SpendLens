import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ShareableAudit } from "@/types";
import { formatCurrency, formatToolName } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens.app";

async function getAudit(id: string): Promise<ShareableAudit | null> {
  try {
    const res = await fetch(`${APP_URL}/api/share/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const audit = await getAudit(params.id);
  if (!audit) return { title: "Audit not found — SpendLens" };
  const savings = audit.totalMonthlySavings;
  const title = savings > 0
    ? `AI Spend Audit — ${formatCurrency(savings)}/mo savings found`
    : "AI Spend Audit — Stack is well-optimised";
  const description = savings > 0
    ? `This team found ${formatCurrency(savings)}/month in AI tool savings. Run your own free audit at SpendLens.`
    : "This team's AI stack is already well-optimised. Run your own free audit at SpendLens.";
  return {
    title, description,
    openGraph: { title, description, url: `${APP_URL}/share/${params.id}`, siteName: "SpendLens", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  if (!audit) notFound();
  const hasSavings = audit.totalMonthlySavings > 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--stone-50)",
      fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
      color: "var(--stone-900)",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        :root{--white:#fff;--stone-50:#fafaf9;--stone-100:#f5f4f0;--stone-200:#e8e6e0;--stone-300:#d4d0c8;--stone-400:#a09890;--stone-500:#736b63;--stone-700:#3d3830;--stone-900:#1a1714;--accent:#1a6b4a;--accent-light:#e8f5ee;--accent-mid:#2d8a62;--radius:10px;--radius-sm:6px;--shadow-sm:0 1px 3px rgba(26,23,20,0.06),0 1px 2px rgba(26,23,20,0.04);}
        *{box-sizing:border-box;margin:0;padding:0;}
      `}</style>

      {/* Header */}
      <header style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--stone-200)",
        padding: "0 32px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <a href="/" style={{ fontSize: 15, fontWeight: 600, color: "var(--stone-900)", textDecoration: "none", letterSpacing: "-0.02em" }}>
          SpendLens
        </a>
        <a href="/" style={{
          fontSize: 13,
          background: "var(--accent)",
          color: "white",
          padding: "7px 16px",
          borderRadius: 99,
          textDecoration: "none",
          fontWeight: 600,
        }}>
          Audit my stack →
        </a>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: 11, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6 }}>
          Shared audit
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 28, color: "var(--stone-900)" }}>
          {hasSavings
            ? `${formatCurrency(audit.totalMonthlySavings)}/mo in savings identified`
            : "Stack is well-optimised"}
        </h1>

        {/* Stats */}
        <div style={{
          background: hasSavings ? "var(--accent)" : "var(--white)",
          border: hasSavings ? "none" : "1px solid var(--stone-200)",
          borderRadius: "var(--radius)",
          padding: 24,
          marginBottom: 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          textAlign: "center",
        }}>
          {[
            { label: "Monthly savings", value: formatCurrency(audit.totalMonthlySavings) },
            { label: "Annual savings",  value: formatCurrency(audit.totalAnnualSavings) },
            { label: "Team size",       value: String(audit.teamSize) },
          ].map((stat) => (
            <div key={stat.label}>
              <p style={{ fontSize: 22, fontWeight: 700, color: hasSavings ? "white" : "var(--accent)", marginBottom: 4 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 12, color: hasSavings ? "rgba(255,255,255,0.65)" : "var(--stone-400)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {audit.recommendations.map((rec) => (
            <div key={rec.toolId} style={{
              background: "var(--white)",
              border: `1px solid ${rec.monthlySavings > 0 ? "#b7ddc8" : "var(--stone-200)"}`,
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div>
                <p style={{ fontWeight: 600, color: "var(--stone-900)", fontSize: 14, marginBottom: 3 }}>
                  {formatToolName(rec.toolId)}
                  <span style={{ marginLeft: 8, fontSize: 11, color: "var(--stone-400)", fontWeight: 400 }}>
                    {rec.currentPlan}
                  </span>
                </p>
                <p style={{ fontSize: 13, color: "var(--stone-400)" }}>{rec.recommendedAction}</p>
              </div>
              {rec.monthlySavings > 0 ? (
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--accent)",
                  background: "var(--accent-light)",
                  padding: "5px 12px",
                  borderRadius: 99,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                  −{formatCurrency(rec.monthlySavings)}/mo
                </span>
              ) : (
                <span style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  background: "var(--accent-light)",
                  padding: "4px 10px",
                  borderRadius: 99,
                  flexShrink: 0,
                }}>
                  ✓ Optimal
                </span>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: "var(--white)",
          border: "1px solid var(--stone-200)",
          borderRadius: "var(--radius)",
          padding: 28,
          textAlign: "center",
          boxShadow: "var(--shadow-sm)",
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.02em", color: "var(--stone-900)" }}>
            Run your own AI spend audit
          </h3>
          <p style={{ color: "var(--stone-400)", fontSize: 14, marginBottom: 18 }}>
            Free, instant, no account required.
          </p>
          <a href="/" style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "white",
            padding: "11px 28px",
            borderRadius: 99,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}>
            Audit my stack →
          </a>
        </div>
      </div>
    </div>
  );
}
