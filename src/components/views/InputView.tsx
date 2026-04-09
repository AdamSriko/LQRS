"use client";

import { useCallback, useEffect, useState } from "react";
import { Coffee, UserCircle, Plus, Pencil, Trash2 } from "lucide-react";

type Tab = "log" | "profile";

export type CastCharacter = {
  id: string;
  name: string;
  tagline: string;
  traits: string;
  relationshipNotes: string;
};

const STORAGE_KEY = "lqrs-cast-characters";

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

function ProfileTab() {
  const [characters, setCharacters] = useState<CastCharacter[]>(DEFAULT_CAST);
  const [hydrated, setHydrated] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<CastCharacter, "id">>(emptyDraft);

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
  }, []);

  const startAdd = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const startEdit = (c: CastCharacter) => {
    setEditingId(c.id);
    setDraft({
      name: c.name,
      tagline: c.tagline,
      traits: c.traits,
      relationshipNotes: c.relationshipNotes,
    });
  };

  const removeCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) resetForm();
  };

  const saveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    const name = draft.name.trim();
    if (!name) return;

    if (editingId) {
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, ...draft, name, tagline: draft.tagline.trim(), traits: draft.traits.trim(), relationshipNotes: draft.relationshipNotes.trim() }
            : c
        )
      );
    } else {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `char-${Date.now()}`;
      setCharacters((prev) => [
        ...prev,
        {
          id,
          name,
          tagline: draft.tagline.trim(),
          traits: draft.traits.trim(),
          relationshipNotes: draft.relationshipNotes.trim(),
        },
      ]);
    }
    resetForm();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-mint/40 bg-mint-soft/35 px-4 py-3 text-sm text-mauve/80 shadow-soft-inner">
        <p>
          <span className="font-medium text-mauve-deep">Cast list</span> — add anyone who might walk
          into Qahwtea, or edit Lavanya, Adam, and the rest. Profiles are saved in this browser
          (local storage).
        </p>
      </div>

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
                  className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-start sm:justify-between ${
                    editingId === c.id
                      ? "border-rosegold-accent/50 bg-gradient-to-r from-blush-soft/40 to-lilac-soft/30 shadow-soft"
                      : "border-blush-soft/50 bg-white/60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-mauve-deep">{c.name}</p>
                    {c.tagline ? (
                      <p className="mt-0.5 text-sm text-mauve/70">{c.tagline}</p>
                    ) : null}
                    {c.traits ? (
                      <p className="mt-2 line-clamp-2 text-xs text-mauve/55">{c.traits}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-lilac-soft/80 bg-cream/70 px-3 py-2 text-xs font-medium text-mauve-deep transition hover:bg-white"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCharacter(c.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blush-soft/80 bg-cream/50 px-3 py-2 text-xs font-medium text-rosegold-accent transition hover:bg-blush-soft/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

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
                id="char-name"
                name="name"
                type="text"
                required
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Mira, weekend opener"
                className="mt-2 w-full rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner"
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
                value={draft.tagline}
                onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))}
                placeholder="How they show up at Qahwtea"
                className="mt-2 w-full rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner"
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
              value={draft.traits}
              onChange={(e) => setDraft((d) => ({ ...d, traits: e.target.value }))}
              placeholder='e.g. "always steams oat milk when stressed"'
              className="mt-2 w-full rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner"
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
              value={draft.relationshipNotes}
              onChange={(e) => setDraft((d) => ({ ...d, relationshipNotes: e.target.value }))}
              placeholder={`Example: Tension with Lavanya over the playlist remote — allies with Adam only when the croissants are fresh.`}
              className="mt-4 w-full resize-y rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm leading-relaxed text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-blush via-blush-deep to-rosegold-accent px-8 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow"
            >
              {editingId ? "Save changes" : "Save new character"}
            </button>
            {(editingId || draft.name || draft.tagline || draft.traits || draft.relationshipNotes) && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-lilac-soft/90 bg-white/80 px-6 py-3 text-sm font-medium text-mauve-deep transition hover:bg-cream"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

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
          {tab === "log" && (
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                  placeholder={`Example: Lavanya was on bar during the 5pm rush. Adam asked for "the usual" but made prolonged eye contact with the loyalty tablet like it owed him money. Someone knocked over a stack of oat cartons; the silence before Lavanya said "I've got it" could've been cut with a cake knife.`}
                  className="mt-4 w-full resize-y rounded-2xl border border-lilac-soft/80 bg-cream/50 px-4 py-3 text-sm leading-relaxed text-mauve-deep placeholder:text-mauve/35 shadow-soft-inner transition focus:border-blush-deep/50 focus:bg-white"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-blush via-blush-deep to-rosegold-accent px-8 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow focus-visible:ring-offset-cream"
                >
                  Submit to Drama Engine
                </button>
                <span className="text-xs text-mauve/55">
                  Connects to your vault context &amp; agent pipeline (coming soon).
                </span>
              </div>
            </form>
          )}

          {tab === "profile" && <ProfileTab />}
        </div>
      </div>
    </div>
  );
}
