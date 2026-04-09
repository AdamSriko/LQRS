import { NextRequest, NextResponse } from "next/server";
import {
  readLoreFiles,
  readSkillFiles,
  readState,
  writeState,
  saveRawScenario,
} from "@/lib/vault-reader";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const scenario: string = body?.scenario ?? "";

  if (!scenario.trim()) {
    return NextResponse.json(
      { error: "Missing `scenario` field in request body." },
      { status: 400 }
    );
  }

  // ── Gather vault context ─────────────────────────────────────────────────

  const agentLogs: string[] = [];

  const loreFiles = readLoreFiles();
  agentLogs.push(`Found ${loreFiles.length} lore file(s): ${loreFiles.map((f) => f.filename).join(", ") || "none"}`);

  for (const file of loreFiles) {
    agentLogs.push(`Reading lore — ${file.filename}…`);
  }

  const skillFiles = readSkillFiles();
  agentLogs.push(`Found ${skillFiles.length} skill file(s): ${skillFiles.map((f) => f.filename).join(", ") || "none"}`);

  for (const file of skillFiles) {
    agentLogs.push(`Applying skill rules — ${file.filename}…`);
  }

  const loreContext = loreFiles.map((f) => `### ${f.filename}\n${f.content}`).join("\n\n");
  const skillContext = skillFiles.map((f) => `### ${f.filename}\n${f.content}`).join("\n\n");

  agentLogs.push("Injecting lore + skill context into script generator…");
  agentLogs.push("Applying drama rules: escalate tension at midpoint, resolve with irony…");
  agentLogs.push("Formatting output as reality TV script…");

  // ── Mock LLM output ──────────────────────────────────────────────────────

  const characterNames = loreFiles.map((f) => f.filename.replace(/\.md$/i, ""));
  const cast = characterNames.length > 0 ? characterNames.join(", ") : "Unknown Cast";

  const finalScript = generateMockScript(scenario, cast, loreContext, skillContext);

  agentLogs.push("Script generated successfully.");

  // ── Persist to vault ─────────────────────────────────────────────────────

  const slug = scenario.slice(0, 40).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const savedFilename = saveRawScenario(slug, `# Raw Scenario\n\n${scenario}\n`);
  agentLogs.push(`Saved raw scenario → obsidian_vault/raw_scenarios/${savedFilename}`);

  const state = readState();
  state.lastScenario = scenario;
  state.processedCount += 1;
  state.history.push({ timestamp: new Date().toISOString(), scenario });
  writeState(state);
  agentLogs.push(`Updated state.json (total processed: ${state.processedCount})`);

  return NextResponse.json({ final_script: finalScript, agent_logs: agentLogs });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateMockScript(
  scenario: string,
  cast: string,
  _loreContext: string,
  _skillContext: string
): string {
  return `LQRS — REALITY TV SCRIPT
========================
CAST: ${cast}
SCENARIO: ${scenario}

[COLD OPEN — INT. QAHWTEA CAFÉ — MORNING]

PRODUCER (V.O.)
Last week, tensions reached a breaking point. This week... someone's going home.

[CONFESSIONAL — ${cast.split(",")[0]?.trim() ?? "CONTESTANT"}]

${cast.split(",")[0]?.trim() ?? "CONTESTANT"}
(staring into the middle distance)
I didn't come here to make friends. I came here to optimise the throughput of this espresso queue.

[CUT TO — MAIN FLOOR]

[Drama escalates at midpoint. A spilled oat-milk latte becomes a referendum on the entire relationship.]

DRAMA BEAT
The crowd goes silent. Someone whispers "this is exactly like last season."

[RESOLUTION — ironic twist: the chaos actually improved the café's Yelp rating by 0.3 stars]

PRODUCER (V.O.)
Next time on LQRS...

[END COLD CLOSE]`;
}
