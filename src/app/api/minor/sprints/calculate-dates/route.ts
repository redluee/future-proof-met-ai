import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const startDate = url.searchParams.get("startDate") || new Date().toISOString().slice(0, 10);
  const durationDays = Number(url.searchParams.get("durationDays") || "14");
  const result = db.calculateSprintDates(startDate, durationDays);
  return NextResponse.json(result);
}
