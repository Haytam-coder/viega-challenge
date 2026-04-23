import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { PrismaClient } from "@/generated/prisma/client";
import { generateDecision } from "@/lib/ai/decide";
import { generateAllPersonas } from "@/lib/ai/debate";
import { z } from "zod";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const Schema = z.object({
  signalId: z.string(),
  userFeedbackContext: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "signalId required" }, { status: 400 });
  }

  const signal = await prisma.signal.findUnique({
    where: { id: parsed.data.signalId },
    include: { analysis: true },
  });

  if (!signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }
  if (!signal.analysis) {
    return NextResponse.json(
      { error: "Signal must be analyzed first" },
      { status: 400 }
    );
  }

  const analysis = {
    summary: signal.analysis.summary,
    keyInsights: signal.analysis.keyInsights,
    relevance: signal.analysis.relevance,
    urgency: signal.analysis.urgency,
    marketImpact: signal.analysis.marketImpact,
    affectedProducts: signal.analysis.affectedProducts,
  };

  const decisionResult = await generateDecision(
    signal.title,
    signal.type,
    analysis,
    parsed.data.userFeedbackContext
  );

  const personas = await generateAllPersonas(
    signal.title,
    decisionResult.verdict,
    decisionResult.reasoning,
    analysis
  );

  const decision = await prisma.$transaction(async (tx: Tx) => {
    const existing = await tx.decision.findUnique({
      where: { signalId: signal.id },
    });
    if (existing) {
      await tx.personaArgument.deleteMany({
        where: { decisionId: existing.id },
      });
      await tx.decision.delete({ where: { id: existing.id } });
    }

    const { impactBreakdown, ...decisionFields } = decisionResult;
    const newDecision = await tx.decision.create({
      data: {
        signalId: signal.id,
        ...decisionFields,
        impactBreakdown: impactBreakdown ? JSON.stringify(impactBreakdown) : null,
        personas: {
          create: personas,
        },
      },
      include: { personas: true },
    });

    await tx.signal.update({
      where: { id: signal.id },
      data: { status: "decided" },
    });

    return newDecision;
  });

  return NextResponse.json(decision);
}
