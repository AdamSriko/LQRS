import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "obsidian_vault", "memory", "last_run.json");

export async function GET() {
  if (!fs.existsSync(LOG_PATH)) {
    return NextResponse.json({ logs: null });
  }
  try {
    const raw = fs.readFileSync(LOG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return NextResponse.json({ logs: null });
    return NextResponse.json({ logs: parsed as string[] });
  } catch {
    return NextResponse.json({ logs: null });
  }
}
