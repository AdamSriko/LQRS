import { NextResponse } from "next/server";

/**
 * Returns whether the drama engine has a non-empty LLM API key configured.
 * Never exposes the key or any substring of it.
 */
export async function GET() {
  const configured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  return NextResponse.json({ configured });
}
