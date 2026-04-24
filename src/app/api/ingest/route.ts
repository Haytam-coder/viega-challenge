export const maxDuration = 60;
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { normalizeUrl } from "@/lib/ai/research";

const IngestSchema = z.object({
  type: z.enum(["competitor", "patent", "market"]),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  source: z.string().min(1),
  rawContent: z.string().min(20),
  tags: z.array(z.string()).default([]),
  autoAnalyze: z.boolean().default(true),
});

export async function POST(req: Request) {
  // Webhook auth — optional, skip if WEBHOOK_SECRET not configured
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-webhook-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json();
  const parsed = IngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { autoAnalyze, ...signalData } = parsed.data;

  // Deduplication by normalized URL
  const normalizedIncoming = normalizeUrl(signalData.source);
  const existingSources = await prisma.signal.findMany({ select: { source: true } });
  const isDuplicate = existingSources.some(
    (s) => normalizeUrl(s.source) === normalizedIncoming
  );
  if (isDuplicate) {
    return NextResponse.json({ error: "duplicate", message: "Signal with this source already exists" }, { status: 409 });
  }

  // Create signal
  const signal = await prisma.signal.create({ data: signalData });

  if (!autoAnalyze) {
    return NextResponse.json({ signalId: signal.id, status: "created", signal });
  }

  // Run pipeline: analyze → decide (via internal fetch so we reuse all existing logic)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const analyzeRes = await fetch(`${base}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signalId: signal.id }),
  });

  if (!analyzeRes.ok) {
    return NextResponse.json({
      signalId: signal.id,
      status: "created",
      error: "Analysis failed — signal saved as pending",
    }, { status: 207 });
  }

  const decideRes = await fetch(`${base}/api/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signalId: signal.id }),
  });

  if (!decideRes.ok) {
    return NextResponse.json({
      signalId: signal.id,
      status: "analyzed",
      error: "Decision failed — signal saved as analyzed",
    }, { status: 207 });
  }

  // Return full signal with analysis + decision
  const full = await prisma.signal.findUnique({
    where: { id: signal.id },
    include: {
      analysis: true,
      decision: { include: { personas: true } },
    },
  });

  return NextResponse.json({ signalId: signal.id, status: "decided", signal: full }, { status: 201 });
}
