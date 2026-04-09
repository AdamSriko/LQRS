import fs from "fs";
import path from "path";

const VAULT_ROOT = path.join(process.cwd(), "obsidian_vault");

// ── Lore & Skills ────────────────────────────────────────────────────────────

function readMarkdownDir(dir: string): { filename: string; content: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      filename: f,
      content: fs.readFileSync(path.join(dir, f), "utf-8"),
    }));
}

export function readLoreFiles() {
  return readMarkdownDir(path.join(VAULT_ROOT, "lore"));
}

export function readSkillFiles() {
  return readMarkdownDir(path.join(VAULT_ROOT, "skills"));
}

// ── State ────────────────────────────────────────────────────────────────────

const STATE_PATH = path.join(VAULT_ROOT, "memory", "state.json");

export interface VaultState {
  lastScenario: string | null;
  processedCount: number;
  history: { timestamp: string; scenario: string }[];
}

const DEFAULT_STATE: VaultState = { lastScenario: null, processedCount: 0, history: [] };

export function readState(): VaultState {
  if (!fs.existsSync(STATE_PATH)) return { ...DEFAULT_STATE };
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as VaultState;
    }
  } catch {
    // fall through to default
  }
  return { ...DEFAULT_STATE };
}

export function writeState(state: VaultState): void {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

// ── Raw Scenarios ────────────────────────────────────────────────────────────

const RAW_SCENARIOS_DIR = path.join(VAULT_ROOT, "raw_scenarios");

export function saveRawScenario(slug: string, content: string): string {
  fs.mkdirSync(RAW_SCENARIOS_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}_${slug}.md`;
  fs.writeFileSync(path.join(RAW_SCENARIOS_DIR, filename), content, "utf-8");
  return filename;
}
