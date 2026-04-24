import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalizeUrl } from "@/lib/ai/research";
import { z } from "zod";

export async function GET() {
  try {
  const signals = await prisma.signal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      analysis: true,
      decision: { include: { personas: true } },
      feedback: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const parsed = signals.map((s) => ({
    ...s,
    decision: s.decision
      ? {
          ...s.decision,
          impactBreakdown: (() => {
            try {
              return s.decision!.impactBreakdown ? JSON.parse(s.decision!.impactBreakdown) : null;
            } catch {
              return null;
            }
          })(),
        }
      : null,
  }));

  return NextResponse.json(parsed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

const CreateSignalSchema = z.object({
  type: z.enum(["competitor", "patent", "market"]),
  title: z.string().min(1),
  description: z.string().min(1),
  source: z.string().min(1),
  rawContent: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateSignalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Normalized URL deduplication
  const normalizedIncoming = normalizeUrl(parsed.data.source);
  const existingSources = await prisma.signal.findMany({ select: { source: true } });
  const isDuplicate = existingSources.some(
    (s) => normalizeUrl(s.source) === normalizedIncoming
  );
  if (isDuplicate) {
    return NextResponse.json({ error: "duplicate" }, { status: 409 });
  }

  const signal = await prisma.signal.create({ data: parsed.data });
  return NextResponse.json(signal, { status: 201 });
}
