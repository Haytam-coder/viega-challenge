import { flashModel } from "./gemini";
import { buildAnalyzePrompt } from "@/lib/prompts/analyze";
import type { AnalysisResult } from "@/types";

export async function analyzeSignal(
  type: string,
  title: string,
  source: string,
  rawContent: string
): Promise<AnalysisResult> {
  const prompt = buildAnalyzePrompt(type, title, source, rawContent);
  const result = await flashModel.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonText = text.startsWith("```")
    ? text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    : text;

  const parsed = JSON.parse(jsonText) as AnalysisResult;

  return {
    summary: parsed.summary,
    keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
    relevance: clamp(parsed.relevance),
    urgency: clamp(parsed.urgency),
    marketImpact: clamp(parsed.marketImpact),
    affectedProducts: Array.isArray(parsed.affectedProducts)
      ? parsed.affectedProducts
      : [],
  };
}

function clamp(n: number): number {
  return Math.min(1, Math.max(0, Number(n) || 0));
}
