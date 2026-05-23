"use client";

import { useState } from "react";
import type { AuditResult } from "@/types";
import { formatCurrency, formatToolName } from "@/lib/utils";
import { LeadCapture } from "./LeadCapture";

interface Props {
  audit: AuditResult;
  onReset: () => void;
}

const card: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--stone-200)",
  borderRadius: "var(--radius)",
  padding: 24,
  boxShadow: "var(--shadow-sm)",
  marginBottom: 16,
};

export function AuditResults({ audit, onReset }: Props) {
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${appUrl}/share/${audit.id}`;
  const hasSavings = audit.totalMonthlySavings > 0;

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>

      {/* ── Hero savings ── */}
      <div className="fade-up" style={{
        ...card,
        background: hasSavings
          ? "var(--accent)"
          : "var(--white)",
        border: hasSavings ? "none" : "1px solid var(--stone-200)",
        padding: "32px 28px",
      }}>
        {hasSavings ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Potential monthly savings
              </p>
              <p style={{ fontSize: 52, fontWeight: 700, color: "white", lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 4 }}>
                {formatCurrency(audit.totalMonthlySavings)}
              </p>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)" }}>
                {formatCurrency(audit.totalAnnualSavings)} per year
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: "var(--radius)",
              padding: "14px 18px",
              minWidth: 160,
            }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>Current spend</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: "white" }}>{formatCurrency(audit.totalCurrentSpend)}/mo</p>
              <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "10px 0" }} />
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>Optimised spend</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: "white" }}>{formatCurrency(audit.totalRecommendedSpend)}/mo</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}>✓</div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>
                You&apos;re spending well.
              </p>
              <p style={{ fontSize: 14, color: "var(--stone-500)" }}>
                Current spend of {formatCurrency(audit.totalCurrentSpend)}/mo is well-optimised for your stack.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── AI summary ── */}
      <div className="fade-up-1" style={card}>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}>
          AI Analysis
        </p>
        <p style={{ fontSize: 15, color: "var(--stone-700)", lineHeight: 1.75 }}>
          {audit.aiSummary}
        </p>
      </div>

      {/* ── Per-tool breakdown ── */}
      <div className="fade-up-2" style={card}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--stone-900)", marginBottom: 16, letterSpacing: "-0.01em" }}>
          Tool breakdown
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {audit.recommendations.map((rec) => (
            <div
              key={rec.toolId}
              style={{
                background: "var(--stone-50)",
                border: `1px solid ${rec.monthlySavings > 0 ? "#b7ddc8" : "var(--stone-200)"}`,
                borderRadius: "var(--radius-sm)",
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--stone-900)" }}>
                      {formatToolName(rec.toolId)}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: "var(--stone-400)",
                      background: "var(--stone-200)",
                      padding: "1px 7px",
                      borderRadius: 99,
                      fontWeight: 500,
                    }}>
                      {rec.currentPlan} · {rec.seats} seat{rec.seats !== 1 ? "s" : ""} · {formatCurrency(rec.currentSpend)}/mo
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: rec.monthlySavings > 0 ? "var(--accent)" : "var(--stone-500)", marginBottom: 4 }}>
                    {rec.recommendedAction}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--stone-400)", lineHeight: 1.6 }}>
                    {rec.reason}
                  </p>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  {rec.monthlySavings > 0 ? (
                    <div style={{
                      background: "var(--accent-light)",
                      border: "1px solid #b7ddc8",
                      borderRadius: "var(--radius-sm)",
                      padding: "6px 10px",
                    }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
                        −{formatCurrency(rec.monthlySavings)}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--accent-mid)" }}>/month</p>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--accent)",
                      background: "var(--accent-light)",
                      padding: "4px 9px",
                      borderRadius: 99,
                    }}>
                      ✓ Optimal
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Credex CTA for high savings ── */}
      {audit.isHighSavings && (
        <div className="fade-up-3" style={{
          ...card,
          background: "#f0faf5",
          border: "1px solid #b7ddc8",
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Go further with Credex
          </p>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--stone-900)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Lock in even more savings on AI credits
          </h3>
          <p style={{ fontSize: 14, color: "var(--stone-500)", lineHeight: 1.65, marginBottom: 16 }}>
            Credex sources discounted Cursor, Claude, and ChatGPT Enterprise credits from companies that overforecast. The discount is real. With {formatCurrency(audit.totalMonthlySavings)}/month already on the table, there may be more.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            Talk to Credex →
          </a>
        </div>
      )}

      {/* ── Lead capture ── */}
      {!leadSubmitted ? (
        <div className="fade-up-3">
          <LeadCapture
            auditId={audit.id}
            isHighSavings={audit.isHighSavings}
            hasSavings={hasSavings}
            onSuccess={() => setLeadSubmitted(true)}
          />
        </div>
      ) : (
        <div style={{
          ...card,
          background: "var(--accent-light)",
          border: "1px solid #b7ddc8",
          textAlign: "center",
          padding: "16px 24px",
        }}>
          <p style={{ margin: 0, color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>
            ✓ Audit sent to your inbox
          </p>
        </div>
      )}

      {/* ── Share + reset ── */}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          onClick={copyShareLink}
          style={{
            flex: 1,
            padding: "11px 16px",
            background: "var(--white)",
            border: "1.5px solid var(--stone-200)",
            color: "var(--stone-700)",
            borderRadius: "var(--radius)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--stone-300)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--stone-200)")}
        >
          {copied ? "✓ Link copied!" : "Copy share link"}
        </button>
        <button
          onClick={onReset}
          style={{
            padding: "11px 16px",
            background: "transparent",
            border: "1.5px solid var(--stone-200)",
            color: "var(--stone-400)",
            borderRadius: "var(--radius)",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Start over
        </button>
      </div>
    </div>
  );
}
