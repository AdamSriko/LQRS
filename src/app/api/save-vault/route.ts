import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ALLOWED_TYPES = ["lore", "skill"] as const;
type VaultType = (typeof ALLOWED_TYPES)[number];

function sanitizeFilename(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

export async function POST(req: NextRequest) {
  let body: { type?: unknown; filename?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { type, filename, content } = body;

  if (!ALLOWED_TYPES.includes(type as VaultType)) {
    return NextResponse.json(
      { error: `Field 'type' must be one of: ${ALLOWED_TYPES.join(", ")}.` },
      { status: 400 }
    );
  }

  if (typeof filename !== "string" || !filename.trim()) {
    return NextResponse.json({ error: "Field 'filename' must be a non-empty string." }, { status: 400 });
  }

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Field 'content' must be a non-empty string." }, { status: 400 });
  }

  const safe = sanitizeFilename(filename.replace(/\.md$/i, ""));
  if (!safe) {
    return NextResponse.json({ error: "Filename resolves to an empty string after sanitization." }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "obsidian_vault", type as VaultType);
  const filePath = path.join(dir, `${safe}.md`);

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
  } catch (err) {
    console.error("[save-vault] write error:", err);
    return NextResponse.json({ error: "Failed to write file to vault." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, path: `obsidian_vault/${type as VaultType}/${safe}.md` });
}
