import { genAI } from "./gemini";
import { VIEGA_SYSTEM_CONTEXT } from "../prompts/system";
import type { SignalDraft, SignalType } from "@/types";

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","ref","source","fbclid","gclid"]
      .forEach((p) => u.searchParams.delete(p));
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const path = u.pathname.replace(/\/$/, "").toLowerCase();
    const qs = u.searchParams.toString();
    return qs ? `${host}${path}?${qs}` : `${host}${path}`;
  } catch {
    return url.toLowerCase().trim();
  }
}

function extractJsonBlock(text: string): unknown[] | null {
  // Try last ```json ... ``` fence first
  const fenceMatches = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
  if (fenceMatches.length > 0) {
    const last = fenceMatches[fenceMatches.length - 1][1].trim();
    try {
      const parsed = JSON.parse(last);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through to bare array
    }
  }

  // Try bare JSON array
  const bareMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (bareMatch) {
    try {
      const parsed = JSON.parse(bareMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through
    }
  }

  return null;
}

export async function researchTopic(
  query: string,
  type: SignalType = "market"
): Promise<SignalDraft[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ googleSearch: {} } as any], // v1beta API uses googleSearch, not googleSearchRetrieval
    generationConfig: { temperature: 0.2 },
  });

  const prompt = `${VIEGA_SYSTEM_CONTEXT}

---

TASK: Use Google Search to find 3 to 5 real, current ${type} signals relevant to Viega's business.

Search query: "${query}"

For each signal you find, extract:
- title: a concise headline (max 120 characters)
- description: 2-3 sentences explaining what this means for Viega specifically
- source: the exact URL where you found this (must start with https://)
- rawContent: 80-120 words synthesizing the key facts IN YOUR OWN WORDS — do not copy text verbatim from the source
- tags: 2-5 relevant tags (e.g. "press-fittings", "DACH", "Geberit", "IoT", "EU-regulation")

Focus on real events from the last 18 months. Prioritize: industry publications, patent databases (EPO, DPMA, USPTO), company press releases, trade press (IKZ, SBZ, TGA Fachplaner), and professional forums.

After your analysis, output ONLY the following JSON block at the very end of your response — no other text after it:

\`\`\`json
[
  {
    "title": "string",
    "description": "string",
    "source": "https://...",
    "rawContent": "string",
    "tags": ["tag1", "tag2"]
  }
]
\`\`\`

Return between 3 and 5 objects. If fewer than 3 real signals are found, return what you have.`;

  const result = await model.generateContent(prompt);

  // Guard against RECITATION / SAFETY blocks before calling .text()
  const candidate = result.response.candidates?.[0];
  if (
    !candidate ||
    candidate.finishReason === "RECITATION" ||
    candidate.finishReason === "SAFETY"
  ) {
    return [];
  }

  let text: string;
  try {
    text = result.response.text();
  } catch {
    return [];
  }

  const raw = extractJsonBlock(text);
  if (!raw) return [];

  // Collect grounding chunk URIs for backfill
  const chunks =
    result.response.candidates?.[0]?.groundingMetadata
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.groundingChunks as Array<{ web?: { uri?: string; title?: string } }> | undefined ?? [];

  const drafts: SignalDraft[] = [];

  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;

    const title = typeof obj.title === "string" ? obj.title.trim() : "";
    const description =
      typeof obj.description === "string" ? obj.description.trim() : "";
    const rawContent =
      typeof obj.rawContent === "string"
        ? obj.rawContent.trim()
        : description; // fallback to description
    let source = typeof obj.source === "string" ? obj.source.trim() : "";
    const tags = Array.isArray(obj.tags)
      ? obj.tags.filter((t): t is string => typeof t === "string")
      : [];

    if (!title || !description) continue;

    // Backfill source URL from grounding chunks if Gemini didn't return a URL
    if (!source.startsWith("http")) {
      const match = chunks.find(
        (c) =>
          c.web?.title
            ?.toLowerCase()
            .includes(title.toLowerCase().slice(0, 20))
      );
      if (match?.web?.uri) source = match.web.uri;
      else if (chunks[0]?.web?.uri) source = chunks[0].web.uri;
      else source = `https://www.google.com/search?q=${encodeURIComponent(title)}`;
    }

    drafts.push({ type, title, description, source, rawContent, tags });
  }

  return drafts;
}
