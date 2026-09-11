import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const evals = db.saveSelfEvaluations(Number(id), body.evaluations || []);
  return NextResponse.json(evals);
}
