"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Terminal } from "lucide-react";

// ── Sample fallback ───────────────────────────────────────────────────────────

const SAMPLE_LOGS = [
  "[VAULT] Loaded 6 lore file(s): adam.md, heba.md, lavanya.md, moe.md, dianara.md, setting_qahwtea.md",
  "[LORE] Reading — lavanya.md",
  "[LORE] Reading — adam.md",
  "[VAULT] Loaded 1 skill file(s): drama_rules.md",
  "[SKILL] Injecting — drama_rules.md",
  "[PROMPT] System prompt assembled. Calling claude-sonnet-4-6 with extended thinking…",
  "[CLAUDE] Done — 4,182 input / 893 output tokens",
  "[VAULT] Episode saved → obsidian_vault/episodes/2026-04-09T08-31-22_morning-rush.md",
  "[VAULT] State updated — 1 episode(s) total",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function logColor(line: string): string {
  if (line.startsWith("[VAULT]")) return "text-mint-soft/90";
  if (line.startsWith("[LORE]")) return "text-lilac-soft/80";
  if (line.startsWith("[SKILL]")) return "text-blush-soft/80";
  if (line.startsWith("[PROMPT]")) return "text-rosegold-light/80";
  if (line.startsWith("[CLAUDE]")) return "text-[#F0D8CF]";
  if (line.startsWith("[ERROR]") || line.startsWith("[WARN]")) return "text-blush/90";
  return "text-[#F0D8CF]";
}

// ── Terminal window ───────────────────────────────────────────────────────────

function TerminalWindow({ logs, isSample }: { logs: string[]; isSample: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-mauve/20 shadow-soft"
      style={{
        boxShadow:
          "0 8px 40px -12px rgba(61, 53, 69, 0.35), 0 0 0 1px rgba(232, 180, 188, 0.15)",
      }}
    >
      {/* Chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-mauve-ink/95 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-blush/90 shadow-[0_0_8px_rgba(232,180,188,0.8)]" />
        <span className="h-3 w-3 rounded-full bg-lilac-soft/80 shadow-[0_0_8px_rgba(196,181,212,0.6)]" />
        <span className="h-3 w-3 rounded-full bg-mint/70 shadow-[0_0_8px_rgba(184,212,200,0.6)]" />
        <span className="ml-3 font-mono text-xs text-rosegold-light/90">
          lqrs-agent — qahwtea-prod
          {isSample && <span className="ml-2 text-mauve/50">(sample run)</span>}
        </span>
      </div>

      {/* Log lines */}
      <div className="bg-gradient-to-b from-[#2A2433] to-[#1E1824] px-4 py-5 sm:px-6 sm:py-6">
        <pre
          className="font-mono text-[13px] leading-relaxed sm:text-sm"
          style={{ color: "#E8C4B8", textShadow: "0 0 24px rgba(232, 196, 184, 0.15)" }}
        >
          {logs.map((line, i) => (
            <div
              key={i}
              className="flex gap-3 border-l-2 border-rosegold-accent/25 py-1 pl-3 hover:border-rosegold-accent/50"
            >
              <span className={`${logColor(line)} break-all`}>{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ── LogsView ──────────────────────────────────────────────────────────────────

export function LogsView() {
  const [logs, setLogs] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const res = await fetch("/api/last-run-logs");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { logs: string[] | null };
      setLogs(data.logs);
    } catch {
      setLogs(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void fetchLogs(); }, []);

  const hasRealLogs = logs !== null && logs.length > 0;
  const displayLogs = hasRealLogs ? logs : SAMPLE_LOGS;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-mauve-deep sm:text-4xl">
            Agent Brain / Logs
          </h1>
          <p className="mt-2 max-w-2xl text-mauve/80">
            A soft terminal — the agent&apos;s last run, replayed. Watch the engine rummage through
            Qahwtea canon before it commits to the bit.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchLogs(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border border-lilac-soft/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-mauve-deep shadow-soft transition hover:bg-cream disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </button>
      </header>

      {/* Empty state — before first run */}
      {!loading && !hasRealLogs && (
        <div className="lqrs-fade-up flex items-start gap-3 rounded-2xl border border-lilac-soft/50 bg-lilac-soft/20 px-4 py-3 text-sm text-mauve/80">
          <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-lilac-deep" aria-hidden />
          <p>
            No runs yet — showing a sample log. Submit a scenario on{" "}
            <Link href="/input" className="font-medium text-rosegold-accent hover:underline">
              Input
            </Link>{" "}
            and the real output will appear here after generation completes.
          </p>
        </div>
      )}

      {/* Real-data banner */}
      {hasRealLogs && (
        <div className="lqrs-fade-up flex items-start gap-3 rounded-2xl border border-mint/40 bg-mint-soft/35 px-4 py-3 text-sm text-mauve/80 shadow-soft-inner">
          <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-mint-deep" aria-hidden />
          <p>
            Showing logs from the last completed run.{" "}
            <Link href="/input" className="font-medium text-rosegold-accent hover:underline">
              Generate a new episode
            </Link>{" "}
            to update them.
          </p>
        </div>
      )}

      {/* Terminal */}
      {!loading && (
        <TerminalWindow logs={displayLogs} isSample={!hasRealLogs} />
      )}

      {/* Skeleton while loading */}
      {loading && (
        <div className="overflow-hidden rounded-3xl border border-mauve/20">
          <div className="flex items-center gap-2 bg-mauve-ink/95 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-blush/90" />
            <span className="h-3 w-3 rounded-full bg-lilac-soft/80" />
            <span className="h-3 w-3 rounded-full bg-mint/70" />
            <div className="lqrs-shimmer ml-3 h-3 w-32 rounded-full" />
          </div>
          <div className="space-y-2 bg-[#2A2433] px-6 py-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="lqrs-shimmer h-3 rounded-full opacity-30" style={{ width: `${60 + (i * 13) % 35}%` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
