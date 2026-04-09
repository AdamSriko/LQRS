import fs from "fs";
import path from "path";

const VAULT_ROOT = path.join(process.cwd(), "obsidian_vault");

// ── Lore & Skills ─────────────────────────────────────────────────────────────

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

// ── State ─────────────────────────────────────────────────────────────────────

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
    // fall through
  }
  return { ...DEFAULT_STATE };
}

export function writeState(state: VaultState): void {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

// ── Raw Scenarios ─────────────────────────────────────────────────────────────

const RAW_SCENARIOS_DIR = path.join(VAULT_ROOT, "raw_scenarios");

export function saveRawScenario(slug: string, content: string): string {
  fs.mkdirSync(RAW_SCENARIOS_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}_${slug}.md`;
  fs.writeFileSync(path.join(RAW_SCENARIOS_DIR, filename), content, "utf-8");
  return filename;
}

// ── Episodes ──────────────────────────────────────────────────────────────────

const EPISODES_DIR = path.join(VAULT_ROOT, "episodes");

export interface EpisodeMeta {
  filename: string;
  title: string;
  generatedAt: string;
  scenarioSlug: string;
  content: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { meta, body: (match[2] ?? "").trim() };
}

function extractTitle(script: string): string {
  const m = script.match(/\*\*Episode Title\*\*[:\s\u2014\u2013-]+(.+)/i);
  if (m?.[1]) return m[1].trim().replace(/\*+/g, "");
  const firstLine = script.split("\n").find((l) => l.trim());
  return firstLine?.replace(/^#+\s*/, "").trim() ?? "Untitled Episode";
}

export function saveEpisode(scenario: string, script: string): string {
  fs.mkdirSync(EPISODES_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = scenario
    .slice(0, 35)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const title = extractTitle(script).replace(/\n/g, " ").slice(0, 120);
  const filename = `${timestamp}_${slug}.md`;
  const frontmatter = `---\ntitle: ${title}\ngeneratedAt: ${new Date().toISOString()}\nscenarioSlug: ${slug}\n---\n\n`;
  fs.writeFileSync(path.join(EPISODES_DIR, filename), frontmatter + script, "utf-8");
  return filename;
}

export function readEpisodes(): EpisodeMeta[] {
  if (!fs.existsSync(EPISODES_DIR)) return [];
  return fs
    .readdirSync(EPISODES_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse()
    .map((filename) => {
      const raw = fs.readFileSync(path.join(EPISODES_DIR, filename), "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      return {
        filename,
        title: meta["title"] ?? extractTitle(body),
        generatedAt: meta["generatedAt"] ?? "",
        scenarioSlug: meta["scenarioSlug"] ?? "",
        content: body,
      };
    });
}

// ── Vault Structure ───────────────────────────────────────────────────────────

export interface VaultFile {
  filename: string;
  sizeBytes: number;
  modifiedAt: string;
}

export interface VaultSection {
  key: string;
  label: string;
  description: string;
  files: VaultFile[];
}

const VAULT_SECTIONS: { key: string; label: string; description: string }[] = [
  {
    key: "lore",
    label: "Character Lore",
    description: "Character profiles and backstories — injected into every generation.",
  },
  {
    key: "skills",
    label: "Drama Skills",
    description: "Rules, output format, and techniques for the Drama Engine.",
  },
  {
    key: "episodes",
    label: "Generated Episodes",
    description: "Every script the engine has produced, saved as markdown.",
  },
  {
    key: "raw_scenarios",
    label: "Raw Scenarios",
    description: "Original shift logs as submitted, before dramatisation.",
  },
  {
    key: "memory",
    label: "State Memory",
    description: "Session state, generation count, and scenario history.",
  },
];

export function readVaultStructure(): VaultSection[] {
  return VAULT_SECTIONS.map(({ key, label, description }) => {
    const dir = path.join(VAULT_ROOT, key);
    const files: VaultFile[] = [];
    if (fs.existsSync(dir)) {
      for (const filename of fs.readdirSync(dir)) {
        try {
          const stat = fs.statSync(path.join(dir, filename));
          if (stat.isFile()) {
            files.push({
              filename,
              sizeBytes: stat.size,
              modifiedAt: stat.mtime.toISOString(),
            });
          }
        } catch {
          // skip unreadable files
        }
      }
      files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    }
    return { key, label, description, files };
  });
}
