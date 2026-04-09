"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EpisodeMeta } from "@/lib/vault-reader";

// ── Tension parsing ───────────────────────────────────────────────────────────

function parseDelta(content: string): number {
  const m = content.match(/Tension\s+Delta[^0-9\-+\n]*([+-]?\d)/i);
  if (!m?.[1]) return 0;
  return Math.max(-3, Math.min(3, parseInt(m[1], 10)));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function tensionLabel(total: number): { label: string; sub: string } {
  if (total >= 6)  return { label: "Critical", sub: "Something has to give." };
  if (total >= 3)  return { label: "Charged",  sub: "The air has weight." };
  if (total >= 1)  return { label: "Simmering", sub: "It's building." };
  if (total === 0) return { label: "Stasis",   sub: "An uneasy equilibrium." };
  if (total >= -2) return { label: "Cooling",  sub: "A step back." };
  return               { label: "Distant",  sub: "They're barely orbiting." };
}

function deltaColor(d: number): string {
  if (d >= 2)  return "bg-rosegold-accent";
  if (d === 1) return "bg-blush-deep";
  if (d === 0) return "bg-lilac-deep/60";
  if (d === -1) return "bg-mint-deep/70";
  return "bg-mint-deep";
}

// ── Mock data for zero-episode state ─────────────────────────────────────────

const MOCK_DELTAS = [1, 0, 2, -1, 2];

// ── Component ─────────────────────────────────────────────────────────────────

export function TensionTracker() {
  const [episodes, setEpisodes] = useState<EpisodeMeta[] | null>(null);

  useEffect(() => {
    void fetch("/api/episodes")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { episodes?: EpisodeMeta[] } | null) => {
        setEpisodes(d?.episodes ?? []);
      })
      .catch(() => setEpisodes([]));
  }, []);

  const isMock = episodes === null || episodes.length === 0;
  const deltas = isMock
    ? MOCK_DELTAS
    : episodes.map((ep) => parseDelta(ep.content));
  const total = clamp(deltas.reduce((s, d) => s + d, 0), -10, 10);
  const last5 = deltas.slice(-5);
  const { label, sub } = tensionLabel(total);

  // bar: 0 = -10, 50% = 0, 100% = +10
  const barPct = ((total + 10) / 20) * 100;

  return (
    <div className="rounded-2xl border border-blush-soft/60 bg-gradient-to-br from-cream-muted/80 to-blush-soft/20 px-4 py-4 shadow-soft">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mauve-deep">
          Arc Tension
        </p>
        {isMock && (
          <span className="rounded-full bg-lilac-soft/60 px-2 py-0.5 text-[10px] font-medium text-mauve/60">
            demo
          </span>
        )}
      </div>

      {/* Status label */}
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-display text-base font-semibold text-rosegold-accent">{label}</p>
        <p className="text-xs text-mauve/55 italic">{sub}</p>
      </div>

      {/* Tension bar */}
      <div className="mt-3">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-mint-soft via-lilac-soft to-blush-soft">
          {/* Needle */}
          <div
            className="absolute top-0 h-full w-1 -translate-x-1/2 rounded-full bg-rosegold-accent shadow-[0_0_6px_rgba(183,110,121,0.6)] transition-all duration-700"
            style={{ left: `${barPct}%` }}
            aria-label={`Tension level: ${total}`}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[9px] text-mauve/35">
          <span>−10</span>
          <span>0</span>
          <span>+10</span>
        </div>
      </div>

      {/* Last 5 episode dots */}
      {last5.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-[10px] text-mauve/45">Last {last5.length}:</span>
          {last5.map((d, i) => (
            <span
              key={i}
              title={d > 0 ? `+${d}` : String(d)}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-soft-inner ${deltaColor(d)}`}
            >
              {d > 0 ? `+${d}` : d}
            </span>
          ))}
        </div>
      )}

      {/* CTA when no real data */}
      {isMock && episodes?.length === 0 && (
        <p className="mt-3 text-[10px] leading-relaxed text-mauve/50">
          Submit a shift on{" "}
          <Link href="/input" className="font-medium text-rosegold-accent hover:underline">
            Input
          </Link>{" "}
          to start tracking the real arc.
        </p>
      )}
    </div>
  );
}
