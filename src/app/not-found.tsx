import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <div className="w-full max-w-md space-y-8">
        {/* Logo mark */}
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blush-soft to-lilac-soft shadow-soft">
          <Sparkles className="h-8 w-8 text-mauve-deep" aria-hidden />
        </span>

        {/* Number */}
        <div>
          <p className="font-display text-8xl font-semibold tracking-tight text-blush-soft sm:text-9xl">
            404
          </p>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-mauve-deep">
            This scene doesn&apos;t exist
          </h1>
          <p className="text-sm leading-relaxed text-mauve/65">
            The page you&apos;re looking for isn&apos;t in the vault. Maybe it was renamed, moved, or was
            never written into the script.
          </p>
        </div>

        {/* Action */}
        <Link
          href="/input"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blush via-blush-deep to-rosegold-accent px-8 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Back to the café
        </Link>

        <p className="text-xs text-mauve/35 italic">
          Table 7 is still available.
        </p>
      </div>
    </div>
  );
}
