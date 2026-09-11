import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".png";
    const filename = `minor_${crypto.randomUUID()}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
      return NextResponse.json({ url: `/uploads/${filename}`, filePath: `/uploads/${filename}`, originalName: file.name });
    } catch {
      // In serverless read-only mode, fall back to base64 Data URL
      const mime = file.type || "image/png";
      const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ url: base64, filePath: base64, originalName: file.name });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload mislukt" }, { status: 500 });
  }
}
