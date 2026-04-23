import { VIEGA_SYSTEM_CONTEXT } from "./system";

export function buildAnalyzePrompt(
  type: string,
  title: string,
  source: string,
  rawContent: string
): string {
  return `${VIEGA_SYSTEM_CONTEXT}

---

TASK: Analyze the following market signal and return a structured JSON assessment.

Signal Type: ${type}
Title: ${title}
Source: ${source}
Raw Content:
${rawContent}

Return ONLY valid JSON (no markdown, no explanation) in this exact structure:
{
  "summary": "2-3 sentence neutral factual summary of what this signal means",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "relevance": <float 0.0-1.0 — how directly relevant to Viega's core business>,
  "urgency": <float 0.0-1.0 — how time-sensitive a Viega response is>,
  "marketImpact": <float 0.0-1.0 — potential impact on Viega's market position>,
  "affectedProducts": ["Viega product area 1", "Viega product area 2"]
}

Scoring guidance:
- relevance 0.9+: direct threat or opportunity to Viega's core press fitting / piping business
- urgency 0.8+: competitor has already shipped or patent window is closing
- marketImpact 0.8+: could shift >5% market share in a key segment`;
}
