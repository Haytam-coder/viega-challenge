import { VIEGA_SYSTEM_CONTEXT } from "./system";
import type { AnalysisResult } from "@/types";

export function buildDecidePrompt(
  title: string,
  type: string,
  analysis: AnalysisResult,
  userFeedbackContext?: string
): string {
  const feedbackSection = userFeedbackContext
    ? `\nUser Feedback Context: ${userFeedbackContext}\n`
    : "";

  return `${VIEGA_SYSTEM_CONTEXT}

---

TASK: Based on the analysis below, generate a strategic decision recommendation for Viega's product leadership.

Signal: ${title}
Signal Type: ${type}
Analysis Summary: ${analysis.summary}
Key Insights: ${analysis.keyInsights.join(" | ")}
Scores — Relevance: ${analysis.relevance.toFixed(2)}, Urgency: ${analysis.urgency.toFixed(2)}, Market Impact: ${analysis.marketImpact.toFixed(2)}
Affected Products: ${analysis.affectedProducts.join(", ")}
${feedbackSection}

Return ONLY valid JSON (no markdown, no explanation):
{
  "verdict": "Build" | "Invest" | "Ignore",
  "confidence": <float 0.0-1.0>,
  "reasoning": "3-4 sentences explaining WHY this verdict, grounded in Viega's specific competitive position and product portfolio",
  "productIdea": "Concrete product or feature idea for Viega (null if Ignore)",
  "timeframe": "6 months" | "12 months" | "2+ years" | null,
  "impactBreakdown": {
    "marketReach":       { "score": <1-5>, "rationale": "one sentence about how many Viega customers/markets are affected" },
    "revenueImpact":     { "score": <1-5>, "rationale": "one sentence about the financial risk or revenue opportunity for Viega" },
    "competitiveThreat": { "score": <1-5>, "rationale": "one sentence about how this shifts Viega's competitive position" },
    "timeSensitivity":   { "score": <1-5>, "rationale": "one sentence about how urgently Viega must respond" }
  }
}

Score definitions for impactBreakdown (1=minimal, 5=critical):
- marketReach: 1=niche segment, 3=one major product line, 5=entire Viega portfolio + DACH market
- revenueImpact: 1=<1% revenue at risk, 3=5-10% at risk or opportunity, 5=>20% revenue impact
- competitiveThreat: 1=irrelevant competitor move, 3=direct Megapress/core product attack, 5=category-defining disruption
- timeSensitivity: 1=monitor over 2 years, 3=act within 12 months, 5=respond within 6 months or lose window

Verdict definitions:
- BUILD: Viega should initiate internal development now — direct competitive threat or proven market need Viega can uniquely fill
- INVEST: Monitor and fund early-stage research or partnerships — clear trend but Viega's response requires validation
- IGNORE: Not relevant enough to act on — outside Viega's domain, too speculative, or non-transferable advantage`;
}
