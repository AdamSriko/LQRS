import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /api/health
 * Returns system readiness without exposing secrets.
 * { ok: boolean, apiKeySet: boolean, vaultExists: boolean }
 */
export async function GET() {
  const apiKeySet =
    Boolean(process.env.ANTHROPIC_API_KEY?.trim()) &&
    process.env.ANTHROPIC_API_KEY !== "your_api_key_here";

  const vaultExists = fs.existsSync(
    path.join(process.cwd(), "obsidian_vault")
  );

  return NextResponse.json({ ok: true, apiKeySet, vaultExists });
}
