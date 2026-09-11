import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const nextInfo = db.getNextSprintNumber();
  return NextResponse.json(nextInfo);
}
