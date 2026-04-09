"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Clapperboard, RefreshCw, Trash2 } from "lucide-react";
import type { EpisodeMeta } from "@/lib/vault-reader";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function preview(content: string, maxLen = 240): string {
  const lines = content.split("\n").filter((l) => l.trim()).slice(0, 6).join(" ");
  return lines.length > maxLen ? lines.slice(0, maxLen) + "…" : lines;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function EpisodeSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-blush-soft/50 bg-white/70 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="lqrs-shimmer h-4 w-64 rounded-full" />
              <div className="lqrs-shimmer h-3 w-32 rounded-full" />
            </div>
            <div className="lqrs-shimmer h-8 w-20 rounded-xl" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="lqrs-shimmer h-3 w-full rounded-full" />
            <div className="lqrs-shimmer h-3 w-5/6 rounded-full" />
            <div className="lqrs-shimmer h-3 w-4/6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Episode card ──────────────────────────────────────────────────────────────

function EpisodeCard({
  episode,
  index,
  onDelete,
}: {
  episode: EpisodeMeta;
  index: number;
  onDelete: (filename: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const episodeNumber = String(index + 1).padStart(2, "0");

  const handleDeleteClick = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(episode.filename);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-blush-soft/60 bg-white/80 shadow-soft transition hover:shadow-glow">
      {/* Header */}
      <div className="border-b border-blush-soft/40 bg-gradient-to-r from-cream-muted via-blush-soft/25 to-lilac-soft/20 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-mauve-deep/85 px-2.5 py-0.5 font-mono text-xs text-blush-soft">
                EP {episodeNumber}
              </span>
              <h2 className="font-display text-lg font-semibold leading-snug text-mauve-deep">
                {episode.title}
              </h2>
            </div>
            {episode.generatedAt && (
              <p className="mt-1 text-xs text-mauve/55">{formatDate(episode.generatedAt)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setExpanded((v) => !v);
              setConfirmDelete(false);
              setDeleteError(null);
            }}
            aria-expanded={expanded}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-lilac-soft/80 bg-white/80 px-4 py-2 text-xs font-medium text-mauve-deep transition hover:bg-cream"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                Read
              </>
            )}
          </button>
        </div>

        {/* Preview snippet — shown when collapsed */}
        {!expanded && (
          <p className="mt-3 line-clamp-2 text-sm italic text-mauve/65">{preview(episode.content)}</p>
        )}
      </div>

      {/* Full script — shown when expanded */}
      {expanded && (
        <div className="px-4 py-6 sm:px-10 sm:py-10">
          <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.35em] text-rosegold-accent">
            Qahwtea — Interior — Golden Hour
          </p>
          <pre className="mx-auto mt-8 max-w-2xl whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-mauve-deep">
            {episode.content}
          </pre>
          <p className="mt-10 text-center font-display text-xs uppercase tracking-widest text-mauve/40">
            End scene
          </p>

          {/* Bottom actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => { setExpanded(false); setConfirmDelete(false); }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-lilac-soft/70 bg-cream/60 px-4 py-2 text-xs font-medium text-mauve-deep transition hover:bg-white"
            >
              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
              Collapse
            </button>

            {/* Delete — two-click confirm */}
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleDeleteClick()}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-rosegold-accent/60 bg-rosegold-accent/10 px-4 py-2 text-xs font-semibold text-rosegold-accent transition hover:bg-rosegold-accent/20 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
                <button
                  type="button"
                  onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
                  className="rounded-2xl border border-lilac-soft/60 bg-cream/50 px-3 py-2 text-xs text-mauve/60 transition hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleDeleteClick()}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-blush-soft/80 bg-cream/50 px-4 py-2 text-xs font-medium text-rosegold-accent transition hover:bg-blush-soft/30"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Delete episode
              </button>
            )}
          </div>

          {/* Delete error */}
          {deleteError && (
            <p className="mt-3 text-center text-xs text-rosegold-accent" role="alert">
              {deleteError}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

// ── ScriptsView ───────────────────────────────────────────────────────────────

export function ScriptsView() {
  const [episodes, setEpisodes] = useState<EpisodeMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEpisodes = async (silent = false) => {
    if (!silent) setEpisodes(null);
    setError(null);
    setRefreshing(true);
    try {
      const res = await fetch("/api/episodes");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = (await res.json()) as { episodes: EpisodeMeta[]; error?: string };
      if (data.error) throw new Error(data.error);
      setEpisodes(data.episodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load episodes.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { void fetchEpisodes(); }, []);

  const handleDelete = async (filename: string) => {
    const res = await fetch(`/api/episodes/${encodeURIComponent(filename)}`, {
      method: "DELETE",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
    // Remove from local list immediately — no refetch needed
    setEpisodes((prev) => prev?.filter((ep) => ep.filename !== filename) ?? prev);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-mauve-deep sm:text-4xl">
            Final Scripts
          </h1>
          <p className="mt-2 max-w-2xl text-mauve/80">
            Every episode the Drama Engine has written, saved to your vault. Click any episode to read
            the full script.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchEpisodes(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border border-lilac-soft/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-mauve-deep shadow-soft transition hover:bg-cream disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </button>
      </header>

      {/* Error */}
      {error && (
        <div className="lqrs-fade-up rounded-2xl border border-blush/50 bg-blush-soft/30 px-4 py-4 text-sm text-rosegold-accent" role="alert">
          {error}
        </div>
      )}

      {/* Loading */}
      {!episodes && !error && <EpisodeSkeleton />}

      {/* Empty state */}
      {episodes?.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-lilac-soft/70 bg-cream/40 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-soft to-lilac-soft shadow-soft">
            <Clapperboard className="h-7 w-7 text-mauve-deep" aria-hidden />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-mauve-deep">No episodes yet</p>
            <p className="mt-1 text-sm text-mauve/65">
              Head to <span className="font-medium text-rosegold-accent">Input → Log Scenario</span> and
              submit your first shift to generate an episode.
            </p>
          </div>
        </div>
      )}

      {/* Episode list */}
      {episodes && episodes.length > 0 && (
        <div className="space-y-6">
          <p className="text-sm text-mauve/60">
            {episodes.length} episode{episodes.length !== 1 ? "s" : ""} — newest first
          </p>
          {episodes.map((ep, i) => (
            <EpisodeCard
              key={ep.filename}
              episode={ep}
              index={i}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
