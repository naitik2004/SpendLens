"use client";

import { useState, useEffect } from "react";
import type { FormState, ToolEntry, ToolId, UseCase } from "@/types";
import { TOOLS } from "@/lib/pricing-data";

const STORAGE_KEY = "spendlens_form_v1";

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding",   label: "Coding / Engineering" },
  { value: "writing",  label: "Writing / Content" },
  { value: "data",     label: "Data / Analytics" },
  { value: "research", label: "Research" },
  { value: "mixed",    label: "Mixed / General" },
];

const DEFAULT_FORM: FormState = { tools: [], teamSize: 1, useCase: "coding" };

interface Props {
  onSubmit: (form: FormState) => void;
  isLoading: boolean;
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
  textTransform: "uppercase" as const,
  marginBottom: 6,
};

export function SpendForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<string[]>([]);

  // Raw string values for inputs while typing — avoids the "snaps to 1" bug
  const [teamSizeRaw, setTeamSizeRaw] = useState("1");
  const [seatsRaw, setSeatsRaw] = useState<Record<string, string>>({});
  const [spendRaw, setSpendRaw] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FormState;
        setForm(parsed);
        setTeamSizeRaw(String(parsed.teamSize));
        const sr: Record<string, string> = {};
        const sp: Record<string, string> = {};
        parsed.tools.forEach((t) => {
          sr[t.toolId] = String(t.seats);
          sp[t.toolId] = String(t.monthlySpend);
        });
        setSeatsRaw(sr);
        setSpendRaw(sp);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  function addTool(toolId: ToolId) {
    if (form.tools.find((t) => t.toolId === toolId)) return;
    const tool = TOOLS.find((t) => t.id === toolId)!;
    const plan = tool.plans[1] ?? tool.plans[0];
    setForm((f) => ({
      ...f,
      tools: [...f.tools, { toolId, plan: plan.id, monthlySpend: plan.pricePerSeatPerMonth, seats: 1 }],
    }));
    setSeatsRaw((r) => ({ ...r, [toolId]: "1" }));
    setSpendRaw((r) => ({ ...r, [toolId]: String(plan.pricePerSeatPerMonth) }));
  }

  function removeTool(toolId: ToolId) {
    setForm((f) => ({ ...f, tools: f.tools.filter((t) => t.toolId !== toolId) }));
    setSeatsRaw((r) => { const n = { ...r }; delete n[toolId]; return n; });
    setSpendRaw((r) => { const n = { ...r }; delete n[toolId]; return n; });
  }

  function updateTool(toolId: ToolId, updates: Partial<ToolEntry>) {
    setForm((f) => ({
      ...f,
      tools: f.tools.map((t) => (t.toolId === toolId ? { ...t, ...updates } : t)),
    }));
  }

  function validate(): boolean {
    const errs: string[] = [];
    if (form.tools.length === 0) errs.push("Add at least one AI tool.");
    if (form.teamSize < 1) errs.push("Team size must be at least 1.");
    setErrors(errs);
    return errs.length === 0;
  }

  const addedIds = new Set(form.tools.map((t) => t.toolId));

  return (
    <div className="fade-up-1">

      {/* About your team */}
      <div style={card}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--stone-900)", marginBottom: 20, letterSpacing: "-0.01em" }}>
          About your team
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Team size</label>
            <input
              type="number"
              value={teamSizeRaw}
              min={1}
              onChange={(e) => setTeamSizeRaw(e.target.value)}
              onBlur={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setTeamSizeRaw(String(val));
                setForm((f) => ({ ...f, teamSize: val }));
              }}
            />
          </div>
          <div>
            <label style={labelStyle}>Primary use case</label>
            <select
              value={form.useCase}
              onChange={(e) => setForm((f) => ({ ...f, useCase: e.target.value as UseCase }))}
            >
              {USE_CASES.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tool selector */}
      <div style={card}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--stone-900)", marginBottom: 6, letterSpacing: "-0.01em" }}>
          Which tools do you pay for?
        </h2>
        <p style={{ fontSize: 13, color: "var(--stone-400)", marginBottom: 16 }}>
          Select all that apply — click again to remove.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {TOOLS.map((tool) => {
            const added = addedIds.has(tool.id);
            return (
              <button
                key={tool.id}
                onClick={() => added ? removeTool(tool.id) : addTool(tool.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 500,
                  border: added ? "1.5px solid var(--accent)" : "1.5px solid var(--stone-200)",
                  background: added ? "var(--accent-light)" : "var(--white)",
                  color: added ? "var(--accent)" : "var(--stone-500)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {added && <span style={{ marginRight: 4 }}>✓</span>}
                {tool.name}
              </button>
            );
          })}
        </div>

        {form.tools.length === 0 && (
          <div style={{
            border: "1.5px dashed var(--stone-200)",
            borderRadius: "var(--radius)",
            padding: "24px 16px",
            textAlign: "center",
            color: "var(--stone-400)",
            fontSize: 14,
          }}>
            Select tools above to enter their details
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {form.tools.map((entry, idx) => {
            const toolInfo = TOOLS.find((t) => t.id === entry.toolId)!;
            const currentPlanInfo = toolInfo.plans.find((p) => p.id === entry.plan);
            return (
              <div
                key={entry.toolId}
                className="fade-up"
                style={{
                  background: "var(--stone-50)",
                  border: "1px solid var(--stone-200)",
                  borderRadius: "var(--radius-sm)",
                  padding: 16,
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--stone-900)" }}>
                    {toolInfo.name}
                  </span>
                  <button
                    onClick={() => removeTool(entry.toolId)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--stone-300)",
                      fontSize: 18,
                      lineHeight: 1,
                      padding: "0 4px",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--stone-700)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--stone-300)")}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {/* Plan */}
                  <div>
                    <label style={labelStyle}>Plan</label>
                    <select
                      value={entry.plan}
                      onChange={(e) => {
                        const plan = toolInfo.plans.find((p) => p.id === e.target.value);
                        const newSpend = plan ? plan.pricePerSeatPerMonth * entry.seats : entry.monthlySpend;
                        updateTool(entry.toolId, { plan: e.target.value, monthlySpend: newSpend });
                        setSpendRaw((r) => ({ ...r, [entry.toolId]: String(newSpend) }));
                      }}
                    >
                      {toolInfo.plans.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Seats — free typing, clamp on blur */}
                  <div>
                    <label style={labelStyle}>Seats</label>
                    <input
                      type="number"
                      value={seatsRaw[entry.toolId] ?? String(entry.seats)}
                      min={1}
                      onChange={(e) =>
                        setSeatsRaw((r) => ({ ...r, [entry.toolId]: e.target.value }))
                      }
                      onBlur={(e) => {
                        const seats = Math.max(1, parseInt(e.target.value) || 1);
                        setSeatsRaw((r) => ({ ...r, [entry.toolId]: String(seats) }));
                        const plan = toolInfo.plans.find((p) => p.id === entry.plan);
                        const newSpend = plan ? plan.pricePerSeatPerMonth * seats : entry.monthlySpend;
                        updateTool(entry.toolId, { seats, monthlySpend: newSpend });
                        setSpendRaw((r) => ({ ...r, [entry.toolId]: String(newSpend) }));
                      }}
                    />
                  </div>

                  {/* Monthly spend — free typing, clamp on blur */}
                  <div>
                    <label style={labelStyle}>Monthly ($)</label>
                    <input
                      type="number"
                      value={spendRaw[entry.toolId] ?? String(entry.monthlySpend)}
                      min={0}
                      onChange={(e) =>
                        setSpendRaw((r) => ({ ...r, [entry.toolId]: e.target.value }))
                      }
                      onBlur={(e) => {
                        const spend = Math.max(0, parseFloat(e.target.value) || 0);
                        setSpendRaw((r) => ({ ...r, [entry.toolId]: String(spend) }));
                        updateTool(entry.toolId, { monthlySpend: spend });
                      }}
                    />
                  </div>
                </div>

                {currentPlanInfo?.notes && (
                  <p style={{ marginTop: 8, fontSize: 12, color: "var(--stone-400)", fontStyle: "italic" }}>
                    {currentPlanInfo.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{
          background: "var(--danger-light)",
          border: "1px solid #f5c6c2",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
          marginBottom: 12,
          fontSize: 13,
          color: "var(--danger)",
        }}>
          {errors.map((e, i) => <p key={i} style={{ margin: 0 }}>{e}</p>)}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={() => validate() && onSubmit(form)}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "13px 24px",
          background: isLoading ? "var(--accent-mid)" : "var(--accent)",
          color: "var(--white)",
          border: "none",
          borderRadius: "var(--radius)",
          fontSize: 15,
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          letterSpacing: "-0.01em",
          transition: "background 0.15s",
          boxShadow: "0 2px 8px rgba(26,107,74,0.25)",
        }}
        onMouseEnter={e => !isLoading && (e.currentTarget.style.background = "var(--accent-mid)")}
        onMouseLeave={e => !isLoading && (e.currentTarget.style.background = "var(--accent)")}
      >
        {isLoading ? "Analysing…" : "Run my free audit →"}
      </button>
      <p style={{ textAlign: "center", color: "var(--stone-400)", fontSize: 12, marginTop: 10 }}>
        Results are instant. No account required.
      </p>
    </div>
  );
}