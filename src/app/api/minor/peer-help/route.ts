import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const items = db.getPeerHelp();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  const body = await req.json();
  const item = db.createPeerHelp(body);
  return NextResponse.json(item);
}
