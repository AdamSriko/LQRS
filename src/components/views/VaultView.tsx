import { FileJson, FileText, FolderOpen, Sparkles } from "lucide-react";

const vaultFiles = [
  {
    name: "drama_rules.md",
    kind: "Markdown",
    blurb: "Escalation beats, confessionals, and when to cue the slow-motion steam wand.",
  },
  {
    name: "lavanya_lore.md",
    kind: "Markdown",
    blurb: "Backstory, apron superstitions, and why she never serves Adam first when the line is long.",
  },
  {
    name: "qahwtea_floorplan.md",
    kind: "Markdown",
    blurb: "Where the drama happens: pastry case choke point, whisper corner by the plant wall.",
  },
  {
    name: "relationship_memory.json",
    kind: "JSON",
    blurb: "Structured edges between Lavanya, Adam, and the rotating cast — tension scores & payoffs.",
  },
  {
    name: "episode_arcs.yaml",
    kind: "YAML",
    blurb: "Season spine: loyalty app betrayal arc, oat milk shortage week, the mystery influencer.",
  },
  {
    name: "confessional_prompts.md",
    kind: "Markdown",
    blurb: "To-camera templates — 'I didn't want to say this, but the croissant basket saw everything.'",
  },
] as const;

function FileIcon({ kind }: { kind: string }) {
  if (kind === "JSON") return <FileJson className="h-5 w-5 text-mint-deep" aria-hidden />;
  return <FileText className="h-5 w-5 text-lilac-deep" aria-hidden />;
}

export function VaultView() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-mauve-deep sm:text-4xl">
          Obsidian Vault
        </h1>
        <p className="mt-2 max-w-2xl text-mauve/80">
          The AI&apos;s instruction library — markdown lore, JSON memory, and house rules pulled into
          every generation pass. Think of it as the mood board behind the mood.
        </p>
      </header>

      <div className="rounded-3xl border border-lilac-soft/70 bg-gradient-to-br from-white/90 via-cream-muted/80 to-blush-soft/30 p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mauve-deep text-blush-soft shadow-soft">
              <FolderOpen className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-mauve-deep">Context sync</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-mauve/75">
                Before the model drafts a scene, it retrieves from these files — like a stylist pulling
                swatches before a shoot. Your vault is the canon for Qahwtea.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-mint/50 bg-mint-soft/60 px-4 py-2 text-xs font-medium text-mauve-deep shadow-soft-inner">
            <Sparkles className="h-4 w-4 text-rosegold-accent" aria-hidden />
            Mock files — wire to disk or CMS later
          </div>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {vaultFiles.map((file) => (
          <li key={file.name}>
            <article className="group flex h-full flex-col rounded-3xl border border-blush-soft/50 bg-white/75 p-5 shadow-soft transition hover:border-lilac/60 hover:shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-cream-deep/80 p-2 shadow-soft-inner">
                    <FileIcon kind={file.kind} />
                  </span>
                  <div>
                    <p className="font-mono text-sm font-medium text-mauve-deep">{file.name}</p>
                    <p className="text-xs uppercase tracking-wider text-mauve/50">{file.kind}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-mauve/75">{file.blurb}</p>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gradient-to-r from-blush-soft via-lilac-soft to-mint-soft opacity-70" aria-hidden />
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
