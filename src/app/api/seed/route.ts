import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MOCK_SIGNALS } from "@/lib/seed/mockData";

export async function POST() {
  const existing = await prisma.signal.count();
  if (existing > 0) {
    return NextResponse.json({ message: "Already seeded", count: existing });
  }

  const created = await prisma.signal.createMany({
    data: MOCK_SIGNALS,
  });

  return NextResponse.json({ seeded: created.count }, { status: 201 });
}

export async function DELETE() {
  await prisma.signal.deleteMany();
  return NextResponse.json({ message: "All signals deleted" });
}
