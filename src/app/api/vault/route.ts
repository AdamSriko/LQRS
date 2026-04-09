import { NextResponse } from "next/server";
import { readVaultStructure } from "@/lib/vault-reader";

export async function GET() {
  try {
    const sections = readVaultStructure();
    return NextResponse.json({ sections });
  } catch (err) {
    console.error("[vault] read error:", err);
    return NextResponse.json({ error: "Failed to read vault structure." }, { status: 500 });
  }
}
