import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const FILES: Record<string, string> = {
  "marcus.md":
    "Marcus. The veteran shift supervisor. Takes espresso extraction times way too seriously. Easily frustrated by inefficiency.",
  "chloe.md":
    "Chloe. The cafe gossip. Spends more time analyzing relationship dynamics than steaming milk. Knows everyone's secrets.",
  "sam.md":
    "Sam. The perpetually confused new hire. Means well but constantly breaks the POS system or drops syrups.",
  "jordan.md":
    "Jordan. The ambitious rival. Thinks he should be running the cafe. Always trying to subtly undermine Adam.",
  "mia.md":
    "Mia. The chaos agent. Thrives only when the line is out the door. High energy, unfiltered, and loud.",
};

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production." }, { status: 403 });
  }
  try {
    const loreDir = path.join(process.cwd(), "obsidian_vault", "lore");
    await mkdir(loreDir, { recursive: true });

    await Promise.all(
      Object.entries(FILES).map(([filename, body]) =>
        writeFile(path.join(loreDir, filename), body + "\n", "utf8")
      )
    );

    return NextResponse.json({ ok: true, files: Object.keys(FILES) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
