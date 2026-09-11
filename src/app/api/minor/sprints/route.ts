import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const sprints = db.getSprints();
  return NextResponse.json(sprints);
}

export async function POST(req: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const body = await req.json();
  const sprint = db.createSprint(body);
  return NextResponse.json(sprint);
}
