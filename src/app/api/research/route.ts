import { NextResponse } from "next/server";
import { z } from "zod";
import { researchTopic } from "@/lib/ai/research";

const ResearchSchema = z.object({
  query: z.string().min(3).max(300),
  type: z.enum(["competitor", "patent", "market"]).optional().default("market"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ResearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const candidates = await researchTopic(parsed.data.query, parsed.data.type);
    return NextResponse.json({ candidates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
