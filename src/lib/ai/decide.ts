import { flashModel } from "./gemini";
import { buildDecidePrompt } from "@/lib/prompts/decide";
import type { AnalysisResult, DecisionResult, ImpactBreakdown, Verdict } from "@/types";

const VALID_VERDICTS: Verdict[] = ["Build", "Invest", "Ignore"];

function clampScore(v: unknown): number {
  return Math.min(5, Math.max(1, Math.round(Number(v) || 3)));
}

function parseBreakdown(raw: unknown): ImpactBreakdown | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const dim = (key: string) => {
    const d = b[key] as Record<string, unknown> | undefined;
    return {
      score: clampScore(d?.score),
      rationale: typeof d?.rationale === "string" ? d.rationale : "",
    };
  };
  return {
    marketReach:       dim("marketReach"),
    revenueImpact:     dim("revenueImpact"),
    competitiveThreat: dim("competitiveThreat"),
    timeSensitivity:   dim("timeSensitivity"),
  };
}

function calcImpactScore(b: ImpactBreakdown): number {
  const weighted =
    b.marketReach.score       * 0.25 +
    b.revenueImpact.score     * 0.35 +
    b.competitiveThreat.score * 0.25 +
    b.timeSensitivity.score   * 0.15;
  return Math.min(10, Math.max(1, Math.round((weighted / 5) * 10)));
}

export async function generateDecision(
  title: string,
  type: string,
  analysis: AnalysisResult,
  userFeedbackContext?: string
): Promise<DecisionResult> {
  const prompt = buildDecidePrompt(title, type, analysis, userFeedbackContext);
  const result = await flashModel.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonText = text.startsWith("```")
    ? text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    : text;

  const parsed = JSON.parse(jsonText) as Record<string, unknown>;

  const breakdown = parseBreakdown(parsed.impactBreakdown);
  const impactScore = breakdown
    ? calcImpactScore(breakdown)
    : Math.min(10, Math.max(1, Math.round(Number(parsed.impactScore) || 5)));

  return {
    verdict: VALID_VERDICTS.includes(parsed.verdict as Verdict)
      ? (parsed.verdict as Verdict)
      : "Invest",
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
    reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
    productIdea: typeof parsed.productIdea === "string" ? parsed.productIdea : null,
    impactScore,
    impactBreakdown: breakdown,
    timeframe: typeof parsed.timeframe === "string" ? parsed.timeframe : null,
  };
}
