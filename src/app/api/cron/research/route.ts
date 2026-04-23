import { NextResponse } from "next/server";
import { researchTopic, normalizeUrl } from "@/lib/ai/research";
import { RESEARCH_TOPICS, type ResearchTopic } from "@/lib/research/topics";
import { prisma } from "@/lib/db/prisma";

export const maxDuration = 300; // 5 min — Vercel Pro/Hobby limit for cron routes

interface TopicResult {
  topic: ResearchTopic;
  saved: number;
  skipped: number;
  error: string | null;
}

async function runTopic(topic: ResearchTopic): Promise<TopicResult> {
  try {
    const candidates = await researchTopic(topic.query, topic.type);
    let saved = 0;
    let skipped = 0;

    // Fetch all existing source URLs once, normalize for comparison
    const existingSources = await prisma.signal.findMany({ select: { source: true } });
    const normalizedExisting = new Set(existingSources.map((s) => normalizeUrl(s.source)));

    for (const candidate of candidates) {
      if (normalizedExisting.has(normalizeUrl(candidate.source))) {
        skipped++;
        continue;
      }

      // Create signal
      const signal = await prisma.signal.create({
        data: {
          type: candidate.type,
          title: candidate.title,
          description: candidate.description,
          source: candidate.source,
          rawContent: candidate.rawContent,
          tags: candidate.tags,
          status: "pending",
        },
      });

      // Run analyze + decide pipeline via internal fetch
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      const analyzeRes = await fetch(`${base}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: signal.id }),
      });
      if (!analyzeRes.ok) continue;

      await fetch(`${base}/api/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: signal.id }),
      });

      saved++;
    }

    return { topic, saved, skipped, error: null };
  } catch (err) {
    return {
      topic,
      saved: 0,
      skipped: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function POST(req: Request) {
  // Verify Vercel cron secret (optional — skip if not configured)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Parse optional filter: ?priority=1 or body { topics: ["Geberit", ...] }
  const url = new URL(req.url);
  const priorityParam = url.searchParams.get("priority");
  const priorityFilter = priorityParam ? parseInt(priorityParam) : null;

  const topics = priorityFilter
    ? RESEARCH_TOPICS.filter((t) => t.priority === priorityFilter)
    : RESEARCH_TOPICS;

  // Run all topics in parallel (Promise.allSettled — individual failures don't abort others)
  const settled = await Promise.allSettled(topics.map(runTopic));

  const results: TopicResult[] = settled.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { topic: {} as ResearchTopic, saved: 0, skipped: 0, error: "Promise rejected" }
  );

  const totalSaved = results.reduce((s, r) => s + r.saved, 0);
  const totalSkipped = results.reduce((s, r) => s + r.skipped, 0);
  const failed = results.filter((r) => r.error !== null).length;

  return NextResponse.json({
    ran: topics.length,
    saved: totalSaved,
    skipped: totalSkipped,
    failed,
    results: results.map((r) => ({
      label: r.topic.label,
      type: r.topic.type,
      priority: r.topic.priority,
      saved: r.saved,
      skipped: r.skipped,
      error: r.error,
    })),
  });
}

// Also support GET for easy browser/curl testing
export async function GET(req: Request) {
  return POST(req);
}
