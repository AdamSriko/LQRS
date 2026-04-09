export default function LogsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="lqrs-shimmer h-9 w-64 rounded-2xl sm:h-10" />
        <div className="mt-3 space-y-2">
          <div className="lqrs-shimmer h-3.5 w-full max-w-lg rounded-full" />
          <div className="lqrs-shimmer h-3.5 w-56 rounded-full" />
        </div>
      </header>

      {/* Terminal window */}
      <div
        className="overflow-hidden rounded-3xl border border-mauve/20 shadow-soft"
        style={{ boxShadow: "0 8px 40px -12px rgba(61,53,69,0.35), 0 0 0 1px rgba(232,180,188,0.15)" }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-mauve-ink/95 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-blush/60" />
          <span className="h-3 w-3 rounded-full bg-lilac-soft/50" />
          <span className="h-3 w-3 rounded-full bg-mint/40" />
          <div className="ml-3 lqrs-shimmer h-3 w-40 rounded-full opacity-40" />
        </div>

        {/* Log lines */}
        <div className="bg-gradient-to-b from-[#2A2433] to-[#1E1824] px-4 py-5 sm:px-6">
          <div className="space-y-3">
            {[
              "w-80", "w-full", "w-72", "w-full", "w-96",
              "w-64", "w-full", "w-4/5", "w-3/4", "w-full",
            ].map((w, i) => (
              <div key={i} className="flex gap-3 border-l-2 border-rosegold-accent/15 pl-3">
                <div className="lqrs-shimmer h-3 w-16 shrink-0 rounded-full opacity-30" />
                <div className={`lqrs-shimmer h-3 ${w} rounded-full opacity-20`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
