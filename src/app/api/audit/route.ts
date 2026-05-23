import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { runAudit } from "@/lib/audit-engine";
import { generateAISummary } from "@/lib/ai-summary";
import { supabase } from "@/lib/supabase";
import type { AuditResult } from "@/types";

const ToolEntrySchema = z.object({
  toolId: z.enum([
    "cursor","github_copilot","claude","chatgpt",
    "anthropic_api","openai_api","gemini","windsurf",
  ]),
  plan: z.string().min(1),
  monthlySpend: z.number().min(0).max(100000),
  seats: z.number().int().min(1).max(10000),
});

const AuditRequestSchema = z.object({
  tools: z.array(ToolEntrySchema).min(1).max(10),
  teamSize: z.number().int().min(1).max(100000),
  useCase: z.enum(["coding","writing","data","research","mixed"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AuditRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { tools, teamSize, useCase } = parsed.data;
    const auditCore = runAudit(tools, teamSize, useCase);

    const aiSummary = await generateAISummary({
      ...auditCore, id: "temp", createdAt: new Date().toISOString(),
    });

    const auditResult: AuditResult = {
      id: nanoid(10),
      createdAt: new Date().toISOString(),
      aiSummary,
      ...auditCore,
    };

    // Persist — fire and forget, don't fail if Supabase is down
    supabase.from("audits").insert({
      id: auditResult.id,
      audit_data: auditResult,
      shareable: true,
    }).then(({ error }) => { if (error) console.error("Supabase insert:", error); });

    return NextResponse.json(auditResult, { status: 200 });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
