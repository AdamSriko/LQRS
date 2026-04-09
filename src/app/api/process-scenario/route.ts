import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import {
  readLoreFiles,
  readSkillFiles,
  readState,
  writeState,
  saveRawScenario,
  saveEpisode,
} from "@/lib/vault-reader";

const LAST_RUN_PATH = path.join(process.cwd(), "obsidian_vault", "memory", "last_run.json");

function saveLastRunLogs(logs: string[]) {
  try {
    fs.mkdirSync(path.dirname(LAST_RUN_PATH), { recursive: true });
    fs.writeFileSync(LAST_RUN_PATH, JSON.stringify(logs, null, 2), "utf-8");
  } catch {
    // non-critical
  }
}

export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const enc = new TextEncoder();
function sse(data: object) {
  return enc.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const scenario: string = body?.scenario ?? "";

  if (!scenario.trim()) {
    return Response.json({ error: "Missing `scenario` field." }, { status: 400 });
  }
  if (scenario.length > 8000) {
    return Response.json({ error: "Scenario exceeds the 8,000 character limit." }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try { controller.enqueue(sse(data)); } catch { /* controller closed */ }
      };

      // ── Gather vault context ───────────────────────────────────────────────

      const postGenLogs: string[] = [];

      const loreFiles = readLoreFiles();
      if (loreFiles.length === 0) {
        send({ type: "log", content: "[VAULT] No lore files found — the engine will invent characters. Add .md files to obsidian_vault/lore/ to fix this." });
      } else {
        send({ type: "log", content: `[VAULT] Loaded ${loreFiles.length} lore file(s): ${loreFiles.map((f) => f.filename).join(", ")}` });
        for (const f of loreFiles) send({ type: "log", content: `[LORE] Reading — ${f.filename}` });
      }

      const skillFiles = readSkillFiles();
      if (skillFiles.length === 0) {
        send({ type: "log", content: "[VAULT] No skill files found — using default drama rules." });
      } else {
        send({ type: "log", content: `[VAULT] Loaded ${skillFiles.length} skill file(s): ${skillFiles.map((f) => f.filename).join(", ")}` });
        for (const f of skillFiles) send({ type: "log", content: `[SKILL] Injecting — ${f.filename}` });
      }

      const loreContext = loreFiles.map((f) => `### ${f.filename}\n${f.content}`).join("\n\n");
      const skillContext = skillFiles.map((f) => `### ${f.filename}\n${f.content}`).join("\n\n");

      send({ type: "log", content: "[PROMPT] System prompt assembled. Calling claude-sonnet-4-6 with extended thinking…" });

      // ── System prompt ──────────────────────────────────────────────────────

      const systemPrompt = `You are the LQRS Drama Engine — an AI that transforms mundane cafe shift logs into highly dramatic reality TV scripts.

## YOUR CHARACTERS & SETTING

${loreContext || "No lore files found. Invent a cast of cafe workers with distinct personalities."}

## YOUR DRAMA RULES & SKILLS

${skillContext || "Apply standard reality TV conventions: confessionals, slow-burn tension, cliffhangers, ironic resolutions."}

## OUTPUT INSTRUCTIONS

Transform the raw scenario log the user provides into a full reality TV episode script. Follow this format exactly:

1. **Episode Title** — evocative, not literal
2. **Cold Open** — 2–3 sentence scene-setter
3. **Act Beats** — 3–5 bullet points of the dramatic arc
4. **Confessionals** — at least one per major character, in character voice, first-person, under 100 words each
5. **Cliffhanger Ending** — the final unresolved beat, cinematic cut-to-black style
6. **Tension Delta** — a score from -3 to +3 for Adam/Lavanya tension this episode

Write with sincerity, not satire. The drama is real within its world. Honour the mundane details — they are the texture. Do not tell the audience how to feel. Show the beat, then cut.`;

      // ── Stream from Claude ─────────────────────────────────────────────────

      let scriptBuffer = "";

      try {
        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 16000,
          thinking: { type: "adaptive" },
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `Here is the raw scenario log to transform:\n\n${scenario}`,
            },
          ],
        });

        anthropicStream.on("thinking", (delta) => {
          send({ type: "thinking_chunk", content: delta });
        });

        anthropicStream.on("text", (delta) => {
          scriptBuffer += delta;
          send({ type: "text_chunk", content: delta });
        });

        const message = await anthropicStream.finalMessage();

        if (!scriptBuffer) {
          send({ type: "error", message: "Model returned no text content — try again." });
          controller.close();
          return;
        }

        const tokLog = `[CLAUDE] Done — ${message.usage.input_tokens} input / ${message.usage.output_tokens} output tokens`;
        postGenLogs.push(tokLog);
        send({ type: "log", content: tokLog });

        // ── Persist (best-effort) ──────────────────────────────────────────

        let episodeFile = "";
        try {
          episodeFile = saveEpisode(scenario, scriptBuffer);
          const l = `[VAULT] Episode saved → obsidian_vault/episodes/${episodeFile}`;
          postGenLogs.push(l);
          send({ type: "log", content: l });
        } catch (err) {
          const l = `[VAULT] Warning: episode not saved — ${err instanceof Error ? err.message : String(err)}`;
          postGenLogs.push(l);
          send({ type: "log", content: l });
        }

        try {
          const slug = scenario.slice(0, 40).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          saveRawScenario(slug, `# Raw Scenario\n\n${scenario}\n`);
          const state = readState();
          state.lastScenario = scenario;
          state.processedCount += 1;
          state.history.push({ timestamp: new Date().toISOString(), scenario });
          writeState(state);
          const l = `[VAULT] State updated — ${state.processedCount} episode(s) total`;
          postGenLogs.push(l);
          send({ type: "log", content: l });
        } catch {
          // non-critical
        }

        saveLastRunLogs(postGenLogs);
        send({ type: "done", episodeFile });
      } catch (error) {
        if (error instanceof Anthropic.APIError) {
          send({ type: "error", message: `Claude API error (${error.status}): ${error.message}` });
        } else {
          send({ type: "error", message: "Unexpected server error — check your API key and vault." });
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
