import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const Schema = z.object({
  signalId: z.string(),
  action: z.enum(["approve", "reject", "boost", "deprioritize"]),
  importance: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const signal = await prisma.signal.findUnique({
    where: { id: parsed.data.signalId },
  });
  if (!signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  const feedback = await prisma.userFeedback.create({
    data: parsed.data,
  });

  return NextResponse.json(feedback, { status: 201 });
}
