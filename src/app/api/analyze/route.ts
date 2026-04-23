import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { analyzeSignal } from "@/lib/ai/analyze";
import { z } from "zod";

const Schema = z.object({ signalId: z.string() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "signalId required" }, { status: 400 });
  }

  const signal = await prisma.signal.findUnique({
    where: { id: parsed.data.signalId },
  });
  if (!signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  const result = await analyzeSignal(
    signal.type,
    signal.title,
    signal.source,
    signal.rawContent
  );

  const analysis = await prisma.analysis.upsert({
    where: { signalId: signal.id },
    create: { signalId: signal.id, ...result },
    update: result,
  });

  await prisma.signal.update({
    where: { id: signal.id },
    data: {
      status: "analyzed",
      relevanceScore: result.relevance,
    },
  });

  return NextResponse.json(analysis);
}
