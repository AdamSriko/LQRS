import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILENAME_RE = /^[\w\-:.]+\.md$/;

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!FILENAME_RE.test(filename)) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "obsidian_vault", "episodes", filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Episode not found." }, { status: 404 });
  }

  try {
    fs.unlinkSync(filePath);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Could not delete file: ${msg}` }, { status: 500 });
  }
}
