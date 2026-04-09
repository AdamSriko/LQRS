"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGeneration } from "@/contexts/GenerationContext";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import {
  AlertCircle,
  Coffee,
  Copy,
  Check,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "log" | "profile";

export type CastCharacter = {
  id: string;
  name: string;
  tagline: string;
  traits: string;
  relationshipNotes: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "lqrs-cast-characters";
const SCENARIO_MAX = 8000; // mirrored from context for char counter

const DEFAULT_CAST: CastCharacter[] = [
  {
    id: "seed-lavanya",
    name: "Lavanya",
    tagline: "Lead barista — calm surface, storm underneath",
    traits: "Steams oat milk when the playlist betrays her.",
    relationshipNotes:
      "Window seat truce with Adam when the mix hits French indie — origin: Valentine's latte incident.",
  },
  {
    id: "seed-adam",
    name: "Adam",
    tagline: "Regular with a reputation",
    traits: "Optimizes orders; apologizes to the floor, not the person.",
    relationshipNotes:
      "Loyalty tablet eye contact is a whole subplot. Owes someone a pastry apology arc.",
  },
];

const GENERATING_MESSAGES = [
  "Reading vault lore…",
  "Loading character memories…",
  "Injecting drama rules…",
  "Drafting confessionals…",
  "Calibrating tension delta…",
  "Polishing the script…",
  "Almost there…",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadCast(): CastCharacter[] {
  if (typeof window === "undefined") return DEFAULT_CAST;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CAST;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CAST;
    return parsed as CastCharacter[];
  } catch {
    return DEFAULT_CAST;
  }
}

function emptyDraft(): Omit<CastCharacter, "id"> {
  return { name: "", tagline: "", traits: "", relationshipNotes: "" };
}

function characterToMarkdown(c: Omit<CastCharacter, "id"> & { name: string }): string {
  const lines: string[] = [`# ${c.name}`];
  if (c.tagline) lines.push(`\n**Role:** ${c.tagline}`);
  if (c.traits) lines.push(`\n## Traits\n\n${c.traits}`);
  if (c.relationshipNotes) lines.push(`\n## Relationship Notes\n\n${c.relationshipNotes}`);
  return lines.join("\n");
}

async function saveToVault(character: Omit<CastCharacter, "id"> & { name: string }): Promise<string> {
  const res = await fetch("/api/save-vault", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "lore",
      filename: character.name,
      content: characterToMarkdown(character),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; path?: string };
  if (!res.ok) throw new Error(data.error ?? "Save failed");
  return data.path ?? "";
}

// ── Shared micro-components ───────────────────────────────────────────────────

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} aria-hidden />;
}


function useCyclingMessage(active: boolean) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) {
      setIdx(0);
      return;
    }
    const t = setInterval(
      () => setIdx((i) => (i + 1) % GENERATING_MESSAGES.length),
      2600
    );
    return () => clearInterval(t);
  }, [active]);
  return GENERATING_MESSAGES[idx]!;
}

// ── Skeleton loading placeholder ──────────────────────────────────────────────

function ScriptSkeleton() {
  return (
    <div className="rounded-2xl border border-blush-soft/40 bg-white/60 px-6 py-6 shadow-soft">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-rosegold-accent/50" aria-hidden />
        <div className="lqrs-shimmer h-3 w-32 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="lqrs-shimmer h-3 w-full rounded-full" />
        <div className="lqrs-shimmer h-3 w-5/6 rounded-full" />
        <div className="lqrs-shimmer h-3 w-full rounded-full" />
        <div className="lqrs-shimmer h-3 w-4/6 rounded-full" />
        <div className="mt-5 lqrs-shimmer h-3 w-full rounded-full" />
        <div className="lqrs-shimmer h-3 w-3/4 rounded-full" />
        <div className="lqrs-shimmer h-3 w-full rounded-full" />
        <div className="lqrs-shimmer h-3 w-5/6 rounded-full" />
        <div className="mt-5 lqrs-shimmer h-3 w-2/3 rounded-full" />
        <div className="lqrs-shimmer h-3 w-full rounded-full" />
        <div className="lqrs-shimmer h-3 w-4/5 rounded-full" />
      </div>
    </div>
  );
}

// ── LogTab ────────────────────────────────────────────────────────────────────

function LogTab() {
  const {
    scenarioText, setScenarioText, softResetOutput,
    logStatus, agentLogs, scriptText, thinkingText,
    isThinking, showReasoning, setShowReasoning,
    logError, copied,
    handleSubmit, clearAll, copyScript,
  } = useGeneration();

  const scriptRef = useRef<HTMLDivElement>(null);
  const statusMessage = useCyclingMessage(logStatus === "submitting");
  const charsLeft = SCENARIO_MAX - scenarioText.length;

  // Auto-scroll to script output the first time text appears
  useEffect(() => {
    if (scriptText && scriptRef.current) {
      scriptRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  // Only trigger on first text appearance, not every char
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!scriptText]);

  const isSubmitting = logStatus === "submitting";

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* In-progress navigation warning */}
      {isSubmitting && (
        <div className="lqrs-fade-up flex items-center gap-2.5 rounded-2xl border border-rosegold/30 bg-blush-soft/25 px-4 py-2.5 text-xs text-mauve/80">
          <Spinner className="h-3.5 w-3.5 shrink-0 text-rosegold-accent" />
          Generating in progress — please don&apos;t navigate away or close this tab.
        </div>
      )}

      {/* Textarea + char counter */}
      <div>
        <label htmlFor="scenario" className="block text-sm font-medium text-mauve-deep">
          What happened today at Qahwtea?
        </label>
        <p className="mt-1 text-xs text-mauve/60">
          Raw notes are fine — the engine will dramatize. Mention rush hour, the pastry case,
          or who stood too close to the pour-over station.
        </p>
        <textarea
          id="scenario"
          name="scenario"
          rows={8}
          required
          disabled={isSubmitting}
          value={scenarioText}
          maxLength={SCENARIO_MAX}
          onChange={(e) => {
            setScenarioText(e.target.value);
            if (logStatus === "done" || logStatus === "error") softResetOutput();
          }}
          placeholder={`Example: Lavanya was on bar during the 5pm rush. Adam asked for "the usual" but made prolonged eye contact with the loyalty tablet like it owed him money. Someone knocked over a stack of oat cartons; the silence before Lavanya said "I've got it" could've been cut with a cake knife.`}
          className="mt-4 w-full resize-y rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm leading-relaxed text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner transition focus:border-blush-deep/50 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <div className="mt-1.5 flex justify-end">
          <span
            className={`font-mono text-xs transition-colors ${
              charsLeft < 200
                ? "font-semibold text-rosegold-accent"
                : charsLeft < 1000
                ? "text-mauve/55"
                : "text-mauve/30"
            }`}
          >
            {scenarioText.length > 0 ? `${scenarioText.length} / ${SCENARIO_MAX}` : ""}
          </span>
        </div>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || !scenarioText.trim()}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blush via-blush-deep to-rosegold-accent px-8 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <><Spinner />Generating…</> : "Submit to Drama Engine"}
        </button>

        {(logStatus === "done" || logStatus === "error") && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-lilac-soft/90 bg-white/80 px-6 py-3 text-sm font-medium text-mauve-deep transition hover:bg-cream"
          >
            New scenario
          </button>
        )}

        {isSubmitting && (
          <span key={statusMessage} className="lqrs-fade-up text-xs text-mauve/60">
            {statusMessage}
          </span>
        )}

        {logStatus === "idle" && !scenarioText && (
          <span className="text-xs text-mauve/45">Vault context + Claude will be used.</span>
        )}
      </div>

      {/* Error */}
      {logStatus === "error" && logError && (
        <div
          className="lqrs-fade-up flex items-start gap-3 rounded-2xl border border-blush/50 bg-blush-soft/30 px-4 py-3"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rosegold-accent" aria-hidden />
          <div>
            <p className="text-sm font-medium text-rosegold-accent">{logError}</p>
            <p className="mt-0.5 text-xs text-mauve/60">
              Check your ANTHROPIC_API_KEY and that the vault directory is writable.
            </p>
          </div>
        </div>
      )}

      {/* Agent logs — stable, non-growing panel */}
      {agentLogs.length > 0 && (
        <div className="rounded-2xl border border-mauve/15 bg-[#2A2433] px-4 py-4">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-rosegold-accent/70">
            Agent logs
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto font-mono text-xs text-[#F0D8CF]">
            {agentLogs.map((line, i) => (
              <div key={i} className="border-l-2 border-rosegold-accent/25 py-0.5 pl-3">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thinking indicator — stable badge, no raw text to jump around */}
      {isThinking && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-lilac-soft/60 bg-lilac-soft/20 px-4 py-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lilac-deep/60 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lilac-deep/80" />
          </span>
          <p className="text-xs font-medium text-mauve/80">Claude is reasoning through your scenario…</p>
        </div>
      )}

      {/* Script output — placeholder skeleton transitions to live text */}
      {(isSubmitting || scriptText) && (
        <div
          ref={scriptRef}
          className="rounded-2xl border border-blush-soft/60 bg-white/80 shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blush-soft/40 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rosegold-accent" aria-hidden />
              <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-rosegold-accent">
                {scriptText ? "Generated Script" : "Preparing script…"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {thinkingText && logStatus === "done" && (
                <button
                  type="button"
                  onClick={() => setShowReasoning((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-lilac-soft/70 bg-cream/70 px-3 py-1.5 text-xs font-medium text-mauve/70 transition hover:bg-white"
                >
                  {showReasoning ? "Hide reasoning" : "View reasoning"}
                </button>
              )}
              {scriptText && (
                <button
                  type="button"
                  onClick={copyScript}
                  title="Copy script to clipboard"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-lilac-soft/70 bg-cream/70 px-3 py-1.5 text-xs font-medium text-mauve-deep transition hover:bg-white"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-mint-deep" aria-hidden />Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" aria-hidden />Copy</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Reasoning panel */}
          {showReasoning && thinkingText && (
            <div className="border-b border-blush-soft/30 bg-lilac-soft/10 px-4 py-4 sm:px-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-lilac-deep/70">
                Claude&apos;s reasoning
              </p>
              <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-mauve/60">
                {thinkingText}
              </pre>
            </div>
          )}

          {/* Script body */}
          {!scriptText ? (
            <div className="px-4 py-4 sm:px-6 sm:py-6">
              <ScriptSkeleton />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-relaxed text-mauve-deep sm:px-6 sm:py-6">
              {scriptText}
              {isSubmitting && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-rosegold-accent align-middle" />
              )}
            </pre>
          )}
        </div>
      )}
    </form>
  );
}

// ── ProfileTab ────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "error";

function ProfileTab() {
  const [characters, setCharacters] = useState<CastCharacter[]>(DEFAULT_CAST);
  const [hydrated, setHydrated] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<CastCharacter, "id">>(emptyDraft);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  useEffect(() => {
    setCharacters(loadCast());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }, [characters, hydrated]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setDraft(emptyDraft());
    setSaveStatus("idle");
    setSaveError(null);
  }, []);

  const startAdd = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setSaveStatus("idle");
    setSaveError(null);
    setConfirmDeleteId(null);
    // Slight delay so React flushes the state before focusing
    setTimeout(() => nameInputRef.current?.focus(), 30);
  };

  const startEdit = (c: CastCharacter) => {
    setEditingId(c.id);
    setDraft({
      name: c.name,
      tagline: c.tagline,
      traits: c.traits,
      relationshipNotes: c.relationshipNotes,
    });
    setSaveStatus("idle");
    setSaveError(null);
    setConfirmDeleteId(null);
    setTimeout(() => nameInputRef.current?.focus(), 30);
  };

  const handleRemoveClick = (id: string) => {
    if (confirmDeleteId === id) {
      // Second click — confirmed
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) resetForm();
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const saveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = draft.name.trim();
    if (!name) return;

    const normalized = {
      name,
      tagline: draft.tagline.trim(),
      traits: draft.traits.trim(),
      relationshipNotes: draft.relationshipNotes.trim(),
    };

    if (editingId) {
      setCharacters((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...normalized } : c))
      );
    } else {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `char-${Date.now()}`;
      setCharacters((prev) => [...prev, { id, ...normalized }]);
    }

    setSaveStatus("saving");
    setSaveError(null);

    try {
      const vaultPath = await saveToVault(normalized);
      showToast(`Saved → ${vaultPath}`, "success");
      setSaveStatus("idle");
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (err) {
      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Could not save to vault.";
      setSaveError(msg);
      showToast(msg, "error");
    }
  };

  const isSaving = saveStatus === "saving";
  const hasDraft = !!(draft.name || draft.tagline || draft.traits || draft.relationshipNotes);

  return (
    <>
      {toast && <Toast key={toast.id} entry={toast} onDismiss={dismissToast} />}

      <div className="space-y-8">
        <div className="rounded-2xl border border-mint/40 bg-mint-soft/35 px-4 py-3 text-sm text-mauve/80 shadow-soft-inner">
          <p>
            <span className="font-medium text-mauve-deep">Cast list</span> — add anyone who might walk
            into Qahwtea, or edit Lavanya, Adam, and the rest. Profiles are saved in this browser and
            written to your local vault.
          </p>
        </div>

        {/* Cast list */}
        <section aria-labelledby="cast-list-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="cast-list-heading" className="font-display text-lg font-semibold text-mauve-deep">
              Your cast
            </h2>
            <button
              type="button"
              onClick={startAdd}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blush-soft bg-white/90 px-4 py-2.5 text-sm font-medium text-mauve-deep shadow-soft transition hover:border-blush-deep/40 hover:shadow-glow"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add character
            </button>
          </div>

          <ul className="mt-4 space-y-3">
            {characters.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-lilac-soft/80 bg-cream/40 px-4 py-8 text-center text-sm text-mauve/60">
                No characters yet. Use &quot;Add character&quot; to create your first.
              </li>
            ) : (
              characters.map((c) => (
                <li key={c.id}>
                  <div
                    className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 transition-colors sm:flex-row sm:items-start sm:justify-between ${
                      editingId === c.id
                        ? "border-rosegold-accent/50 bg-gradient-to-r from-blush-soft/40 to-lilac-soft/30 shadow-soft"
                        : "border-blush-soft/50 bg-white/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-mauve-deep">{c.name}</p>
                      {c.tagline && (
                        <p className="mt-0.5 text-sm text-mauve/70">{c.tagline}</p>
                      )}
                      {c.traits && (
                        <p className="mt-2 line-clamp-2 text-xs text-mauve/55">{c.traits}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-lilac-soft/80 bg-cream/70 px-3 py-2 text-xs font-medium text-mauve-deep transition hover:bg-white"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </button>

                      {confirmDeleteId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveClick(c.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rosegold-accent/60 bg-rosegold-accent/10 px-3 py-2 text-xs font-semibold text-rosegold-accent transition hover:bg-rosegold-accent/20"
                          >
                            Confirm remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-xl border border-lilac-soft/60 bg-cream/50 px-2.5 py-2 text-xs text-mauve/60 transition hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveClick(c.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-blush-soft/80 bg-cream/50 px-3 py-2 text-xs font-medium text-rosegold-accent transition hover:bg-blush-soft/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Add / Edit form */}
        <section aria-labelledby="cast-form-heading" className="border-t border-blush-soft/50 pt-8">
          <h2 id="cast-form-heading" className="font-display text-lg font-semibold text-mauve-deep">
            {editingId ? "Edit character" : "Add character"}
          </h2>
          <p className="mt-1 text-xs text-mauve/60">
            {editingId
              ? "Update traits and relationship memory — changes apply to this profile only."
              : "Create a new cast member for the Drama Engine to remember."}
          </p>

          <form className="mt-6 space-y-6" onSubmit={saveCharacter}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="char-name" className="block text-sm font-medium text-mauve-deep">
                  Name
                </label>
                <input
                  ref={nameInputRef}
                  id="char-name"
                  name="name"
                  type="text"
                  required
                  disabled={isSaving}
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Mira, weekend opener"
                  className="mt-2 w-full rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner transition focus:border-blush-deep/50 focus:bg-white disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="char-tagline" className="block text-sm font-medium text-mauve-deep">
                  Role or tagline
                </label>
                <input
                  id="char-tagline"
                  name="tagline"
                  type="text"
                  disabled={isSaving}
                  value={draft.tagline}
                  onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))}
                  placeholder="How they show up at Qahwtea"
                  className="mt-2 w-full rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner transition focus:border-blush-deep/50 focus:bg-white disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="char-traits" className="block text-sm font-medium text-mauve-deep">
                Traits &amp; context
              </label>
              <input
                id="char-traits"
                name="traits"
                type="text"
                disabled={isSaving}
                value={draft.traits}
                onChange={(e) => setDraft((d) => ({ ...d, traits: e.target.value }))}
                placeholder='e.g. "always steams oat milk when stressed"'
                className="mt-2 w-full rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner transition focus:border-blush-deep/50 focus:bg-white disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="char-notes" className="block text-sm font-medium text-mauve-deep">
                Relationship or scene memory
              </label>
              <p className="mt-1 text-xs text-mauve/60">
                Lore for future episodes — grudges, inside jokes, shift swaps.
              </p>
              <textarea
                id="char-notes"
                name="relationshipNotes"
                rows={5}
                disabled={isSaving}
                value={draft.relationshipNotes}
                onChange={(e) => setDraft((d) => ({ ...d, relationshipNotes: e.target.value }))}
                placeholder="Example: Tension with Lavanya over the playlist remote — allies with Adam only when the croissants are fresh."
                className="mt-4 w-full resize-y rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm leading-relaxed text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner transition focus:border-blush-deep/50 focus:bg-white disabled:opacity-60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blush via-blush-deep to-rosegold-accent px-8 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Spinner />
                    Saving…
                  </>
                ) : editingId ? (
                  "Save changes"
                ) : (
                  "Save new character"
                )}
              </button>

              {(editingId || hasDraft) && !isSaving && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-lilac-soft/90 bg-white/80 px-6 py-3 text-sm font-medium text-mauve-deep transition hover:bg-cream"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Inline error (backup — toast also fires) */}
            {saveStatus === "error" && saveError && (
              <div
                className="lqrs-fade-up flex items-start gap-3 rounded-2xl border border-blush/50 bg-blush-soft/30 px-4 py-3"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rosegold-accent" aria-hidden />
                <p className="text-sm font-medium text-rosegold-accent">{saveError}</p>
              </div>
            )}
          </form>
        </section>
      </div>
    </>
  );
}

// ── InputView ─────────────────────────────────────────────────────────────────

export function InputView() {
  const [tab, setTab] = useState<Tab>("log");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-mauve-deep sm:text-4xl">
          Input
        </h1>
        <p className="mt-2 max-w-2xl text-mauve/80">
          Feed the Drama Engine what happened at Qahwtea today, or sharpen how we know Lavanya, Adam,
          and the rest of the cast.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-blush-soft/60 bg-white/70 shadow-soft backdrop-blur-sm">
        <div
          role="tablist"
          className="flex border-b border-blush-soft/50 bg-cream-muted/60 p-2 sm:p-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "log"}
            onClick={() => setTab("log")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-all sm:text-base ${
              tab === "log"
                ? "bg-white text-mauve-deep shadow-soft"
                : "text-mauve/65 hover:bg-white/50 hover:text-mauve-deep"
            }`}
          >
            <Coffee className="h-4 w-4 shrink-0" aria-hidden />
            Log Scenario
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "profile"}
            onClick={() => setTab("profile")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-all sm:text-base ${
              tab === "profile"
                ? "bg-white text-mauve-deep shadow-soft"
                : "text-mauve/65 hover:bg-white/50 hover:text-mauve-deep"
            }`}
          >
            <UserCircle className="h-4 w-4 shrink-0" aria-hidden />
            Update Profile
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {tab === "log" && <LogTab />}
          {tab === "profile" && <ProfileTab />}
        </div>
      </div>
    </div>
  );
}
