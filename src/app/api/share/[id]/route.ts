import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { AuditResult, ShareableAudit } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from("audits")
      .select("id, created_at, audit_data, shareable")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    if (!data.shareable) {
      return NextResponse.json({ error: "This audit is not public" }, { status: 403 });
    }

    const audit = data.audit_data as AuditResult;

    // Strip PII — only return tools and savings numbers
    const shareable: ShareableAudit = {
      id: audit.id,
      createdAt: audit.createdAt,
      recommendations: audit.recommendations.map((r) => ({
        toolId: r.toolId,
        currentPlan: r.currentPlan,
        monthlySavings: r.monthlySavings,
        annualSavings: r.annualSavings,
        recommendedAction: r.recommendedAction,
        isOptimal: r.isOptimal,
      })),
      totalMonthlySavings: audit.totalMonthlySavings,
      totalAnnualSavings: audit.totalAnnualSavings,
      useCase: audit.useCase,
      teamSize: audit.teamSize,
    };

    return NextResponse.json(shareable);
  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
