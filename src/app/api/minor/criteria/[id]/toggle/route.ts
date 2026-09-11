import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const item = db.toggleCriterion(Number(id), Boolean(body.isCompleted));
  if (!item) return NextResponse.json({ error: "Criterium niet gevonden" }, { status: 404 });
  return NextResponse.json(item);
}
