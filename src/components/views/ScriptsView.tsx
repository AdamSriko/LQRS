const episodes = [
  {
    title: "Episode 03 — Steam and Suspicion",
    slug: "S01E03",
    logline:
      "Lavanya holds the line at Qahwtea while Adam's loyalty points become a referendum on belonging.",
    body: [
      { speaker: "LAVANYA", line: "(quietly, to the espresso dial)\nYou don't get to rush the ritual." },
      { speaker: "ADAM", line: "I'm not rushing. I'm… optimizing. The app said I have a free pastry." },
      { speaker: "LAVANYA", line: "The app doesn't know what you did by the oat cartons." },
      { speaker: "ADAM", line: "I apologized for that." },
      { speaker: "LAVANYA", line: "You apologized to the floor." },
    ],
  },
  {
    title: "Cold Open — The French Indie Interlude",
    slug: "WEB-CLIP",
    logline: "Confessional shot: Adam pretends the playlist isn't a love letter to chaos.",
    body: [
      { speaker: "ADAM", line: "(to camera, mug half-raised)\nIf Lavanya looks at me like that again, I'm switching to decaf. That's not a threat. That's a cry for help." },
      { speaker: "LAVANYA", line: "(OFF-SCREEN, from bar)\nWe don't say decaf after 4pm. House rules." },
    ],
  },
] as const;

function ScriptBlock({
  speaker,
  line,
}: {
  speaker: string;
  line: string;
}) {
  return (
    <div className="my-6">
      <p className="text-center font-display text-sm font-semibold uppercase tracking-[0.25em] text-mauve-deep">
        {speaker}
      </p>
      <p className="mt-3 whitespace-pre-line text-center font-display text-base leading-relaxed text-mauve/90">
        {line}
      </p>
    </div>
  );
}

export function ScriptsView() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-mauve-deep sm:text-4xl">
          Final Scripts
        </h1>
        <p className="mt-2 max-w-2xl text-mauve/80">
          Episodes ready for the reality-TV treatment — character names centered, dialogue breathing
          underneath, Qahwtea as the fifth lead.
        </p>
      </header>

      <div className="space-y-8">
        {episodes.map((ep) => (
          <article
            key={ep.slug}
            className="overflow-hidden rounded-3xl border border-blush-soft/60 bg-white/80 shadow-soft backdrop-blur-sm"
          >
            <div className="border-b border-blush-soft/50 bg-gradient-to-r from-cream-muted via-blush-soft/30 to-lilac-soft/25 px-6 py-5 sm:px-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-mauve-deep">{ep.title}</h2>
                <span className="rounded-full bg-mauve-deep/90 px-3 py-1 font-mono text-xs text-blush-soft">
                  {ep.slug}
                </span>
              </div>
              <p className="mt-2 text-sm italic text-mauve/75">{ep.logline}</p>
            </div>
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.35em] text-rosegold-accent">
                Qahwtea — Interior — Golden Hour
              </p>
              <div className="mx-auto mt-8 max-w-lg">
                {ep.body.map((block, i) => (
                  <ScriptBlock key={`${ep.slug}-${i}`} speaker={block.speaker} line={block.line} />
                ))}
              </div>
              <p className="mt-10 text-center font-display text-xs uppercase tracking-widest text-mauve/45">
                End scene
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
