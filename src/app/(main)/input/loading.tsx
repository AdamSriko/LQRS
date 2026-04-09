export default function InputLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="lqrs-shimmer h-9 w-32 rounded-2xl sm:h-10" />
        <div className="mt-3 space-y-2">
          <div className="lqrs-shimmer h-3.5 w-full max-w-md rounded-full" />
          <div className="lqrs-shimmer h-3.5 w-72 rounded-full" />
        </div>
      </header>

      {/* Tab card */}
      <div className="overflow-hidden rounded-3xl border border-blush-soft/60 bg-white/70 shadow-soft">
        {/* Tab bar */}
        <div className="flex gap-2 border-b border-blush-soft/50 bg-cream-muted/60 p-2 sm:p-3">
          <div className="h-11 flex-1 rounded-2xl bg-white/80 shadow-soft" />
          <div className="lqrs-shimmer h-11 flex-1 rounded-2xl" />
        </div>

        <div className="p-6 space-y-6 sm:p-8">
          {/* Label */}
          <div>
            <div className="lqrs-shimmer h-4 w-56 rounded-full" />
            <div className="mt-2 lqrs-shimmer h-3 w-80 rounded-full" />
            {/* Textarea */}
            <div className="mt-4 lqrs-shimmer h-44 w-full rounded-2xl" />
            <div className="mt-2 flex justify-end">
              <div className="lqrs-shimmer h-3 w-10 rounded-full" />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-center gap-4">
            <div className="lqrs-shimmer h-12 w-52 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
