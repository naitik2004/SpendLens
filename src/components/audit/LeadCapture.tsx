"use client";

import { useState } from "react";

interface Props {
  auditId: string;
  isHighSavings: boolean;
  hasSavings: boolean;
  onSuccess: () => void;
}

const card: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--stone-200)",
  borderRadius: "var(--radius)",
  padding: 24,
  boxShadow: "var(--shadow-sm)",
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--stone-500)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 6,
};

export function LeadCapture({ auditId, isHighSavings, hasSavings, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, email, companyName: company || undefined, role: role || undefined, website }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit.");
      }
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={card}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--stone-900)", marginBottom: 4, letterSpacing: "-0.01em" }}>
        {hasSavings ? "Get this report in your inbox" : "Stay updated on new optimisations"}
      </h3>
      <p style={{ fontSize: 13, color: "var(--stone-400)", marginBottom: 20, lineHeight: 1.5 }}>
        {hasSavings
          ? "We'll send you the full audit breakdown."
          : "We'll notify you when new savings options apply to your stack."}
        {isHighSavings && " A Credex team member may also reach out."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Work email *</label>
          <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Honeypot — hidden */}
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Company</label>
            <input type="text" placeholder="Optional" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <input type="text" placeholder="Optional" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>

        {error && <p style={{ margin: 0, color: "var(--danger)", fontSize: 13 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "11px 20px",
            background: loading ? "var(--accent-mid)" : "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Sending…" : "Send me the report"}
        </button>
        <p style={{ margin: 0, fontSize: 12, color: "var(--stone-300)", textAlign: "center" }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
