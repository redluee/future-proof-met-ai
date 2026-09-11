import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const story = db.updateStory(Number(id), body);
  if (!story) return NextResponse.json({ error: "Story niet gevonden" }, { status: 404 });
  return NextResponse.json(story);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const { id } = await params;
  const success = db.deleteStory(Number(id));
  return NextResponse.json({ success });
}
