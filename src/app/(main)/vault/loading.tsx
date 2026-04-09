export default function VaultLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="lqrs-shimmer h-9 w-52 rounded-2xl sm:h-10" />
        <div className="mt-3 space-y-2">
          <div className="lqrs-shimmer h-3.5 w-full max-w-lg rounded-full" />
          <div className="lqrs-shimmer h-3.5 w-80 rounded-full" />
        </div>
      </header>

      {/* Context sync banner */}
      <div className="lqrs-shimmer h-24 w-full rounded-3xl" />

      {/* File grid */}
      <ul className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="flex h-36 flex-col rounded-3xl border border-blush-soft/40 bg-white/60 p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="lqrs-shimmer h-9 w-9 rounded-xl" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="lqrs-shimmer h-3.5 w-36 rounded-full" />
                  <div className="lqrs-shimmer h-3 w-12 rounded-full" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="lqrs-shimmer h-3 w-full rounded-full" />
                <div className="lqrs-shimmer h-3 w-4/5 rounded-full" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
