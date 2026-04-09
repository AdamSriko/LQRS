import { NextResponse } from "next/server";
import { readEpisodes } from "@/lib/vault-reader";

export async function GET() {
  try {
    const episodes = readEpisodes();
    return NextResponse.json({ episodes });
  } catch (err) {
    console.error("[episodes] read error:", err);
    return NextResponse.json({ error: "Failed to read episodes." }, { status: 500 });
  }
}
