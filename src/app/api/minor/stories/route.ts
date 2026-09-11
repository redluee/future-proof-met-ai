import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sprintId = url.searchParams.get("sprintId");
  const stories = db.getStories(sprintId !== null ? Number(sprintId) : undefined);
  return NextResponse.json(stories);
}

export async function POST(req: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const body = await req.json();
  const story = db.createStory(body);
  return NextResponse.json(story);
}
