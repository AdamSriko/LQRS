"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LQRS] Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md space-y-6">
        {/* Icon */}
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blush-soft to-lilac-soft shadow-soft">
          <AlertCircle className="h-8 w-8 text-rosegold-accent" aria-hidden />
        </span>

        {/* Copy */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-mauve-deep">
            Something went wrong
          </h1>
          <p className="text-sm leading-relaxed text-mauve/70">
            The Drama Engine hit an unexpected snag. This is usually temporary — a retry is often enough.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-mauve/40">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blush via-blush-deep to-rosegold-accent px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
          <Link
            href="/input"
            className="inline-flex items-center rounded-2xl border border-lilac-soft/80 bg-white/80 px-6 py-3 text-sm font-medium text-mauve-deep shadow-soft transition hover:bg-cream"
          >
            Back to Input
          </Link>
        </div>

        {/* Ambient */}
        <p className="text-xs text-mauve/35 italic">
          The espresso machine is still running. We&apos;ll be right back.
        </p>
      </div>
    </div>
  );
}
