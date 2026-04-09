"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Clapperboard,
  FileJson,
  FileText,
  FolderOpen,
  RefreshCw,
  ScrollText,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { VaultSection } from "@/lib/vault-reader";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelative(iso: string): string {
  if (!iso) return "";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

function FileIcon({ filename }: { filename: string }) {
  if (filename.endsWith(".json"))
    return <FileJson className="h-4 w-4 shrink-0 text-mint-deep" aria-hidden />;
  return <FileText className="h-4 w-4 shrink-0 text-lilac-deep" aria-hidden />;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  lore: <Brain className="h-5 w-5" aria-hidden />,
  skills: <Wand2 className="h-5 w-5" aria-hidden />,
  episodes: <Clapperboard className="h-5 w-5" aria-hidden />,
  raw_scenarios: <ScrollText className="h-5 w-5" aria-hidden />,
  memory: <FileJson className="h-5 w-5" aria-hidden />,
};

const SECTION_COLORS: Record<string, string> = {
  lore: "from-blush-soft to-lilac-soft/60",
  skills: "from-lilac-soft to-mint-soft/60",
  episodes: "from-rosegold/20 to-blush-soft/60",
  raw_scenarios: "from-cream-deep to-blush-soft/40",
  memory: "from-mint-soft to-cream-deep/60",
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function VaultSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-blush-soft/40 bg-white/60 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="lqrs-shimmer h-10 w-10 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="lqrs-shimmer h-3.5 w-24 rounded-full" />
              <div className="lqrs-shimmer h-2.5 w-16 rounded-full" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="lqrs-shimmer h-2.5 w-full rounded-full" />
            <div className="lqrs-shimmer h-2.5 w-3/4 rounded-full" />
          </div>
          <div className="mt-4 space-y-1.5">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="lqrs-shimmer h-8 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: VaultSection }) {
  const gradient = SECTION_COLORS[section.key] ?? "from-cream-deep to-blush-soft/40";
  const icon = SECTION_ICONS[section.key] ?? <FolderOpen className="h-5 w-5" aria-hidden />;

  return (
    <article className="flex flex-col rounded-3xl border border-blush-soft/50 bg-white/80 shadow-soft transition hover:shadow-glow">
      {/* Card header */}
      <div className={`flex items-center gap-3 rounded-t-3xl bg-gradient-to-r p-5 ${gradient}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-mauve-deep shadow-soft-inner">
          {icon}
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-mauve-deep">{section.label}</p>
          <p className="text-xs text-mauve/60">
            {section.files.length === 0
              ? "empty"
              : `${section.files.length} file${section.files.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="px-5 pt-4 text-xs leading-relaxed text-mauve/65">{section.description}</p>

      {/* File list */}
      <div className="mt-3 flex-1 px-5 pb-5">
        {section.files.length === 0 ? (
          <p className="rounded-xl border border-dashed border-lilac-soft/70 bg-cream/40 px-3 py-4 text-center text-xs text-mauve/45">
            No files yet
          </p>
        ) : (
          <ul className="space-y-1.5">
            {section.files.map((file) => (
              <li key={file.filename}>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-blush-soft/40 bg-cream/50 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileIcon filename={file.filename} />
                    <span className="truncate font-mono text-xs text-mauve-deep">
                      {file.filename}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-mauve/45">
                    <span>{formatBytes(file.sizeBytes)}</span>
                    <span className="hidden sm:inline">{formatRelative(file.modifiedAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

// ── VaultView ─────────────────────────────────────────────────────────────────

export function VaultView() {
  const [sections, setSections] = useState<VaultSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVault = async (silent = false) => {
    if (!silent) setSections(null);
    setError(null);
    setRefreshing(true);
    try {
      const res = await fetch("/api/vault");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = (await res.json()) as { sections: VaultSection[]; error?: string };
      if (data.error) throw new Error(data.error);
      setSections(data.sections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load vault.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { void fetchVault(); }, []);

  const totalFiles = sections?.reduce((n, s) => n + s.files.length, 0) ?? 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-mauve-deep sm:text-4xl">
            Obsidian Vault
          </h1>
          <p className="mt-2 max-w-2xl text-mauve/80">
            The AI&apos;s instruction library — every file here shapes what gets written. Live view of
            your local vault.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchVault(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border border-lilac-soft/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-mauve-deep shadow-soft transition hover:bg-cream disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </button>
      </header>

      {/* Status bar */}
      {sections && (
        <div className="flex items-center gap-2 rounded-2xl border border-mint/40 bg-mint-soft/40 px-4 py-3 text-sm shadow-soft-inner">
          <Sparkles className="h-4 w-4 shrink-0 text-rosegold-accent" aria-hidden />
          <span className="text-mauve/80">
            <span className="font-medium text-mauve-deep">{totalFiles} file{totalFiles !== 1 ? "s" : ""}</span>
            {" "}across {sections.filter((s) => s.files.length > 0).length} active section{sections.filter((s) => s.files.length > 0).length !== 1 ? "s" : ""}
            {" "}— vault is live
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="lqrs-fade-up rounded-2xl border border-blush/50 bg-blush-soft/30 px-4 py-4 text-sm text-rosegold-accent" role="alert">
          {error}
        </div>
      )}

      {/* Loading */}
      {!sections && !error && <VaultSkeleton />}

      {/* Grid */}
      {sections && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <SectionCard key={section.key} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
