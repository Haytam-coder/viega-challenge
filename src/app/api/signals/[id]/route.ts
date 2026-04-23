import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const signal = await prisma.signal.findUnique({
    where: { id },
    include: {
      analysis: true,
      decision: { include: { personas: { orderBy: { createdAt: "asc" } } } },
      feedback: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!signal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...signal,
    decision: signal.decision
      ? {
          ...signal.decision,
          impactBreakdown: signal.decision.impactBreakdown
            ? JSON.parse(signal.decision.impactBreakdown)
            : null,
        }
      : null,
  });
}
