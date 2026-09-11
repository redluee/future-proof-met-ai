import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sprint = db.getSprintFull(Number(id));
  if (!sprint) {
    return NextResponse.json({ error: "Sprint niet gevonden" }, { status: 404 });
  }
  return NextResponse.json(sprint);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const sprint = db.updateSprint(Number(id), body);
  if (!sprint) {
    return NextResponse.json({ error: "Sprint niet gevonden" }, { status: 404 });
  }
  return NextResponse.json(sprint);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const { id } = await params;
  const success = db.deleteSprint(Number(id));
  return NextResponse.json({ success });
}
