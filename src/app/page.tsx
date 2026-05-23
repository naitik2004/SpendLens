"use client";

import { useState } from "react";
import type { FormState, AuditResult } from "@/types";
import { SpendForm } from "@/components/form/SpendForm";
import { AuditResults } from "@/components/audit/AuditResults";

type Step = "form" | "loading" | "results";

export default function HomePage() {
  const [step, setStep] = useState<Step>("form");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [apiError, setApiError] = useState("");

  async function handleFormSubmit(form: FormState) {
    setStep("loading");
    setApiError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Audit failed.");
      }
      const result: AuditResult = await res.json();
      setAudit(result);
      setStep("results");
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Something went wrong.");
      setStep("form");
    }
  }

  function handleReset() {
    setAudit(null);
    setStep("form");
    setApiError("");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--stone-50)" }}>

      {/* ── Header ── */}
      <header style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--stone-200)",
        padding: "0 32px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M7 11h8M11 7l4 4-4 4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--stone-900)", letterSpacing: "-0.02em" }}>
            SpendLens
          </span>
          <span style={{
            fontSize: 11,
            color: "var(--stone-400)",
            background: "var(--stone-100)",
            padding: "2px 7px",
            borderRadius: 99,
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}>
            by Credex
          </span>
        </div>
        <a
          href="https://credex.rocks"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: "var(--stone-400)", textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--stone-700)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--stone-400)")}
        >
          credex.rocks ↗
        </a>
      </header>

      {/* ── Hero (form only) ── */}
      {step === "form" && (
        <div style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--stone-200)",
          padding: "64px 32px 56px",
          textAlign: "center",
        }} className="fade-up">
          <div style={{
            display: "inline-block",
            background: "var(--accent-light)",
            color: "var(--accent)",
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: 99,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}>
            Free · No account needed
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 700,
            color: "var(--stone-900)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 16,
            maxWidth: 560,
            margin: "0 auto 16px",
          }}>
            Are you overpaying<br />for AI tools?
          </h1>
          <p style={{
            fontSize: 17,
            color: "var(--stone-500)",
            maxWidth: 440,
            margin: "0 auto",
            lineHeight: 1.65,
            fontWeight: 400,
          }}>
            Enter your stack. Get an instant, honest breakdown of where your money is going — and exactly what to change.
          </p>
        </div>
      )}

      {/* ── Results header ── */}
      {step === "results" && (
        <div style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--stone-200)",
          padding: "32px 32px 28px",
        }} className="fade-up">
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <p style={{ fontSize: 12, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6 }}>
              Audit complete
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>
              Your AI spend report
            </h1>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {step === "loading" && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px",
          gap: 16,
        }}>
          <div style={{
            width: 36,
            height: 36,
            border: "2.5px solid var(--stone-200)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}/>
          <p style={{ color: "var(--stone-400)", fontSize: 14 }}>Analysing your stack…</p>
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ padding: "40px 24px 80px", maxWidth: 780, margin: "0 auto" }}>
        {step === "form" && (
          <>
            {apiError && (
              <div style={{
                background: "var(--danger-light)",
                border: "1px solid #f5c6c2",
                borderRadius: "var(--radius)",
                padding: "12px 16px",
                marginBottom: 20,
                fontSize: 14,
                color: "var(--danger)",
              }}>
                {apiError}
              </div>
            )}
            <SpendForm onSubmit={handleFormSubmit} isLoading={false} />
          </>
        )}
        {step === "results" && audit && (
          <AuditResults audit={audit} onReset={handleReset} />
        )}
      </div>

      {/* ── Footer ── */}
      {step === "form" && (
        <footer style={{
          borderTop: "1px solid var(--stone-200)",
          padding: "20px 32px",
          textAlign: "center",
          background: "var(--white)",
        }}>
          <p style={{ fontSize: 12, color: "var(--stone-400)" }}>
            Pricing verified weekly from official vendor pages · Built by{" "}
            <a href="https://credex.rocks" style={{ color: "var(--accent)", textDecoration: "none" }}>Credex</a>
          </p>
        </footer>
      )}
    </div>
  );
}
