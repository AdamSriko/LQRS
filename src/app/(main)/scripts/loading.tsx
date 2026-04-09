export default function ScriptsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="lqrs-shimmer h-9 w-44 rounded-2xl sm:h-10" />
          <div className="mt-3 space-y-2">
            <div className="lqrs-shimmer h-3.5 w-full max-w-md rounded-full" />
            <div className="lqrs-shimmer h-3.5 w-60 rounded-full" />
          </div>
        </div>
        <div className="lqrs-shimmer h-10 w-24 rounded-2xl" />
      </div>

      {/* Episode cards */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-blush-soft/50 bg-white/70 shadow-soft"
          >
            {/* Card header */}
            <div className="border-b border-blush-soft/40 bg-gradient-to-r from-cream-muted via-blush-soft/20 to-lilac-soft/15 px-6 py-5 sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="lqrs-shimmer h-5 w-12 rounded-full" />
                    <div className="lqrs-shimmer h-5 w-52 rounded-full" />
                  </div>
                  <div className="lqrs-shimmer h-3 w-28 rounded-full" />
                </div>
                <div className="lqrs-shimmer h-8 w-16 rounded-2xl" />
              </div>
              {/* Preview lines */}
              <div className="mt-4 space-y-2">
                <div className="lqrs-shimmer h-3 w-full rounded-full" />
                <div className="lqrs-shimmer h-3 w-4/5 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
