const mockLogs = [
  { t: "14:02:11", line: "[LQRS] Session started — vault index warm." },
  { t: "14:02:12", line: "Searching vault for 'Rush Hour' + 'Lavanya' + 'Adam'…" },
  { t: "14:02:14", line: "Match: lavanya_lore.md (snippet: window seat / French indie playlist)" },
  { t: "14:02:15", line: "Match: relationship_memory.json — tension_edge(adam→lavanya): 0.74" },
  { t: "14:02:18", line: "Found tension between Adam and Lavanya near pastry case (spatial: choke point)." },
  { t: "14:02:21", line: "Applying drama_rules.md — beat: MISUNDERSTANDING → SIDE-EYE → STEAM WAND RISE" },
  { t: "14:02:24", line: "Drafting scene… slug: QAHWTEA_504 — 'The Loyalty Tablet Stared Back'" },
  { t: "14:02:27", line: "Injecting confessional_prompts.md template #12 (reluctant truth)." },
  { t: "14:02:30", line: "Polish pass: rose-gold lighting cues, oat milk motif density OK." },
  { t: "14:02:33", line: "Done. Episode card emitted to Final Scripts." },
] as const;

export function LogsView() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-mauve-deep sm:text-4xl">
          Agent Brain / Logs
        </h1>
        <p className="mt-2 max-w-2xl text-mauve/80">
          A soft, girly terminal — chain-of-thought without the harsh IDE glare. Watch the engine
          rummage through Qahwtea canon before it commits to the bit.
        </p>
      </header>

      <div
        className="overflow-hidden rounded-3xl border border-mauve/20 shadow-soft"
        style={{
          boxShadow: "0 8px 40px -12px rgba(61, 53, 69, 0.35), 0 0 0 1px rgba(232, 180, 188, 0.15)",
        }}
      >
        <div className="flex items-center gap-2 border-b border-white/10 bg-mauve-ink/95 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-blush/90 shadow-[0_0_8px_rgba(232,180,188,0.8)]" />
          <span className="h-3 w-3 rounded-full bg-lilac-soft/80 shadow-[0_0_8px_rgba(196,181,212,0.6)]" />
          <span className="h-3 w-3 rounded-full bg-mint/70 shadow-[0_0_8px_rgba(184,212,200,0.6)]" />
          <span className="ml-3 font-mono text-xs text-rosegold-light/90">lqrs-agent — qahwtea-prod</span>
        </div>
        <div className="bg-gradient-to-b from-[#2A2433] to-[#1E1824] px-4 py-5 sm:px-6 sm:py-6">
          <pre
            className="font-mono text-[13px] leading-relaxed sm:text-sm"
            style={{
              color: "#E8C4B8",
              textShadow: "0 0 24px rgba(232, 196, 184, 0.15)",
            }}
          >
            {mockLogs.map((row) => (
              <div key={row.t} className="flex gap-3 border-l-2 border-rosegold-accent/25 pl-3 py-1 hover:border-rosegold-accent/50">
                <span className="shrink-0 select-none text-rosegold-accent/55">{row.t}</span>
                <span className="text-[#F0D8CF]">{row.line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>

      <p className="text-center text-xs text-mauve/50">
        Mock CoT stream — replace with SSE or websocket logs from your LLM pipeline.
      </p>
    </div>
  );
}
